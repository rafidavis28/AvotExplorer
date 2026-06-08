"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { GraphData, GraphNode } from "@/lib/types";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

const STAR = "#ece2c4";
const ORB = "#d8a93f";
const ORB_GLOW = "#f0c869";
const EDGE = "#5b6088";

interface ForceMethods {
  zoomToFit: (ms?: number, px?: number) => void;
  centerAt: (x?: number, y?: number, ms?: number) => void;
  zoom: (z?: number, ms?: number) => void;
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

  // Pan/zoom to a node when requested (search / browser selection).
  useEffect(() => {
    if (!centerOnId) return;
    const target = data.nodes.find((n) => n.id === centerOnId);
    if (target && target.x != null && target.y != null) {
      fgRef.current?.centerAt(target.x, target.y, 700);
      fgRef.current?.zoom(target.type === "theme" ? 3.5 : 5, 700);
    }
  }, [centerOnId, data]);

  const drawNode = (node: SimNode, ctx: CanvasRenderingContext2D, scale: number) => {
    const x = node.x ?? 0;
    const y = node.y ?? 0;
    const isTheme = node.type === "theme";
    const lit = !highlightIds || highlightIds.has(node.id);
    const selected = node.id === selectedId;
    const alpha = lit ? 1 : 0.12;

    const r = isTheme ? 6 : 3;
    ctx.globalAlpha = alpha;

    // glow
    ctx.beginPath();
    ctx.arc(x, y, r * (selected ? 2.4 : 1.9), 0, Math.PI * 2);
    ctx.fillStyle = isTheme ? "rgba(216,169,63,0.22)" : "rgba(236,226,196,0.16)";
    ctx.fill();

    // core
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = isTheme ? ORB : STAR;
    ctx.fill();

    if (selected) {
      ctx.lineWidth = 1.4 / scale;
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
              ctx.arc(node.x ?? 0, node.y ?? 0, node.type === "theme" ? 8 : 5, 0, Math.PI * 2);
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
          onEngineStop={() => fgRef.current?.zoomToFit(500, 60)}
          onNodeClick={((n: SimNode) => onSelectNode(n.id)) as never}
          onNodeHover={((n: SimNode | null) => onHoverNode(n ? n.id : null)) as never}
        />
      )}
    </div>
  );
}
