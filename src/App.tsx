import { useState, useMemo } from "react";
import ReactFlow, { Controls, Background, DefaultEdgeOptions } from "reactflow";
import "reactflow/dist/style.css";
import data from "./data/Tutorial-nodes-0.json";
import "reactflow/dist/style.css";
import TextUpdaterNode from "./CustomNode";

// Convert Blender format to ReactFlow
const nodes = data.nodes.map((node) => ({
  id: node.uuid,
  position: node.location,
  type: "textUpdater",
  data: {
    label: node.name,
    width: node.width,
    height: node.height,
    inputs: node.inputs,
    outputs: node.outputs,
    color: node.color,
    selected: node.select,
    hide: node.hide,
    use_custom_color: node.use_custom_color,
  },
}));

const edges = data.links.map((link) => {
  const hash = Number(new Date()).toString(36);

  return {
    id: hash,
    source: link.from_node,
    target: link.to_node,
    sourceHandle: link.from_socket.type,
    targetHandle: link.to_socket.type,
  };
});

const defaultEdgeOptions: DefaultEdgeOptions = {
  // animated: true,
};

function App() {
  const nodeTypes = useMemo(() => ({ textUpdater: TextUpdaterNode }), []);
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} defaultEdgeOptions={defaultEdgeOptions}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default App;
