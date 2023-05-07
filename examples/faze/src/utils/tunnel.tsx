import tunnel from "tunnel-rat";

const Tunnel = tunnel();

export const DOM = Tunnel.In;

export const RenderDOM = Tunnel.Out;
