"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getMishnah } from "@/lib/data";
import { themeWeights } from "@/lib/graph";
import { sagesForMishnah } from "@/lib/sages";
import type { GraphData, GraphNode } from "@/lib/types";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <p className="animate-pulse font-display text-sm tracking-[0.2em] text-foreground/40">
        CHARTING THE CONSTELLATION…
      </p>
    </div>
  ),
});

const STAR = "#ece2c4";
const ORB = "#d8a93f";
const ORB_GLOW = "#f0c869";

interface ForceMethods {
  zoomToFit: (ms?: number, px?: number) => void;
  centerAt: (x?: number, y?: number, ms?: number) => void;
  zoom: (z?: number, ms?: number) => void;
  graph2ScreenCoords: (x: number, y: number) => { x: number; y: number };
}

// A node as react-force-graph augments it (adds x/y/vx/vy).
type SimNode = GraphNode & { x?: number; y?: number };
type SimLink = { source: string; target: string; type: string };

export interface GraphViewProps {
  graph: GraphData;
  selectedId: string | null;
  /** Set of node ids to keep lit; null = everything lit. */
  highlightIds: Set<string> | null;
  /** When this changes, the camera pans/zooms to the node. */
  centerOnId?: string | null;
  onSelectNode: (id: string) => void;
  onHoverNode: (id: string | null) => void;
}

/** Radius of a node: themes grow with the number of teachings they bind. */
function nodeRadius(node: SimNode, weights: Map<string, number>): number {
  if (node.type !== "theme") return 3;
  return 4.2 + Math.sqrt(weights.get(node.id) ?? 1) * 0.85;
}

export function GraphView({
  graph,
  selectedId,
  highlightIds,
  centerOnId,
  onSelectNode,
  onHoverNode,
}: GraphViewProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceMethods | undefined>(undefined);
  const [size, setSize] = useState({ w: 0, h: 0 });
  // Hovered node plus its screen position, captured when the hover begins.
  const [hovered, setHovered] = useState<{ node: SimNode; x: number; y: number } | null>(null);
  const fittedOnce = useRef(false);
  const pendingCenter = useRef<string | null>(null);

  const weights = useMemo(() => themeWeights(graph), [graph]);

  // Deep-clone so the force simulation never mutates our pristine data.
  const data = useMemo(
    () => ({
      nodes: graph.nodes.map((n) => ({ ...n })) as SimNode[],
      links: graph.edges.map((e) => ({ source: e.source, target: e.target, type: e.type })) as SimLink[],
    }),
    [graph],
  );

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const centerOn = (id: string): boolean => {
    const target = data.nodes.find((n) => n.id === id);
    if (target && target.x != null && target.y != null) {
      fgRef.current?.centerAt(target.x, target.y, 700);
      fgRef.current?.zoom(target.type === "theme" ? 3.5 : 5, 700);
      return true;
    }
    return false;
  };

  // Pan/zoom to a node when requested (search / browser / deep link). If the
  // simulation hasn't placed nodes yet, retry once the engine settles.
  useEffect(() => {
    if (!centerOnId) return;
    if (centerOn(centerOnId)) {
      pendingCenter.current = null;
      // An explicit center outranks the initial fit-to-view.
      fittedOnce.current = true;
    } else {
      pendingCenter.current = centerOnId;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerOnId, data]);

  const drawNode = (node: SimNode, ctx: CanvasRenderingContext2D, scale: number) => {
    const x = node.x ?? 0;
    const y = node.y ?? 0;
    const isTheme = node.type === "theme";
    const lit = !highlightIds || highlightIds.has(node.id);
    const selected = node.id === selectedId;
    const isHovered = node.id === hovered?.node.id;
    const alpha = lit ? 1 : 0.12;

    const r = nodeRadius(node, weights);
    ctx.globalAlpha = alpha;

    // glow
    ctx.beginPath();
    ctx.arc(x, y, r * (selected ? 2.4 : isHovered ? 2.2 : 1.9), 0, Math.PI * 2);
    ctx.fillStyle = isTheme ? "rgba(216,169,63,0.22)" : "rgba(236,226,196,0.16)";
    ctx.fill();

    // core
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = isTheme ? ORB : STAR;
    ctx.fill();

    if (selected || isHovered) {
      ctx.lineWidth = (selected ? 1.4 : 0.9) / scale;
      ctx.strokeStyle = ORB_GLOW;
      ctx.stroke();
    }

    // labels: themes always (when lit), mishnayot only when zoomed in
    const showLabel = lit && (isTheme || scale > 2.4);
    if (showLabel) {
      const fontSize = (isTheme ? 5.5 : 3.4) + 2 / scale;
      ctx.font = `${isTheme ? 600 : 400} ${fontSize}px Georgia, serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = isTheme ? "#f3e6c2" : "rgba(236,226,196,0.85)";
      ctx.fillText(node.label, x, y + r + 1.5);
    }
    ctx.globalAlpha = 1;
  };

  const hoveredNode = hovered?.node ?? null;
  const hoveredMishnah = hoveredNode?.type === "mishnah" ? getMishnah(hoveredNode.ref) : null;
  const hoveredSages = hoveredNode?.type === "mishnah" ? sagesForMishnah(hoveredNode.ref) : [];

  return (
    <div ref={wrapRef} className="absolute inset-0">
      {size.w > 0 && (
        <ForceGraph2D
          ref={fgRef as never}
          width={size.w}
          height={size.h}
          graphData={data}
          backgroundColor="rgba(0,0,0,0)"
          nodeRelSize={4}
          nodeCanvasObject={drawNode as never}
          nodePointerAreaPaint={
            ((node: SimNode, color: string, ctx: CanvasRenderingContext2D) => {
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(
                node.x ?? 0,
                node.y ?? 0,
                Math.max(nodeRadius(node, weights) + 2.5, 5.5),
                0,
                Math.PI * 2,
              );
              ctx.fill();
            }) as never
          }
          linkColor={
            ((l: { source: SimNode; target: SimNode; type: string }) => {
              const lit =
                !highlightIds ||
                (highlightIds.has(typeof l.source === "object" ? l.source.id : (l.source as string)) &&
                  highlightIds.has(typeof l.target === "object" ? l.target.id : (l.target as string)));
              return l.type === "theme-theme"
                ? lit ? "rgba(216,169,63,0.35)" : "rgba(216,169,63,0.05)"
                : lit ? "rgba(91,96,136,0.5)" : "rgba(91,96,136,0.07)";
            }) as never
          }
          linkWidth={((l: { type: string }) => (l.type === "theme-theme" ? 1.2 : 0.5)) as never}
          cooldownTicks={120}
          onEngineStop={() => {
            // Fit only on the first settle — re-heats (e.g. node drags) must
            // not yank the camera. Deep-link centering waits for this moment.
            if (pendingCenter.current) {
              centerOn(pendingCenter.current);
              pendingCenter.current = null;
            } else if (!fittedOnce.current) {
              fgRef.current?.zoomToFit(500, 60);
            }
            fittedOnce.current = true;
          }}
          onNodeClick={((n: SimNode) => onSelectNode(n.id)) as never}
          onNodeHover={
            ((n: SimNode | null) => {
              if (n && n.x != null && n.y != null && fgRef.current) {
                const pt = fgRef.current.graph2ScreenCoords(n.x, n.y);
                setHovered({ node: n, x: pt.x, y: pt.y });
              } else {
                setHovered(null);
              }
              onHoverNode(n ? n.id : null);
            }) as never
          }
        />
      )}

      {/* Hover preview — a whisper of the teaching before you tap */}
      {hovered && hoveredNode && (
        <div
          aria-hidden
          className="pointer-events-none absolute z-20 w-72 max-w-[70vw] rounded-xl border border-gold/25 bg-night-deep/90 p-3 shadow-xl shadow-black/50 backdrop-blur"
          style={{
            left: Math.min(hovered.x + 14, Math.max(size.w - 300, 8)),
            top: Math.min(hovered.y + 14, Math.max(size.h - 130, 8)),
          }}
        >
          {hoveredNode.type === "mishnah" ? (
            <>
              <p className="font-display text-sm font-semibold text-gold-bright">
                {hoveredNode.ref}
                {hoveredSages[0] && (
                  <span className="ml-2 font-normal text-foreground/60">{hoveredSages[0].name}</span>
                )}
              </p>
              {hoveredMishnah && (
                <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-foreground/70">
                  {hoveredMishnah.english}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="font-display text-sm font-semibold text-gold-bright">
                {hoveredNode.label}
                <span className="ml-2 font-normal text-foreground/60">
                  {weights.get(hoveredNode.id) ?? 0} teachings
                </span>
              </p>
              {hoveredNode.type === "theme" && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-foreground/70">
                  {hoveredNode.blurb}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
