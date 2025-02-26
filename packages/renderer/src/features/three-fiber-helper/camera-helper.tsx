/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { extend } from "@react-three/fiber";
import {
  BufferGeometry,
  Camera,
  Color,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Vector3,
  type OrthographicCamera,
  type PerspectiveCamera,
} from "three";

class CameraInstance extends Camera {}

const _vector = new Vector3();
const _camera = new CameraInstance();

class TriplexCameraHelper extends LineSegments {
  camera: PerspectiveCamera | OrthographicCamera;
  pointMap: Record<string, number[]>;

  constructor(camera: PerspectiveCamera | OrthographicCamera) {
    const geometry = new BufferGeometry();
    const material = new LineBasicMaterial({
      color: 0xff_ff_ff,
      toneMapped: false,
      vertexColors: true,
    });

    const vertices: number[] = [];
    const colors: number[] = [];
    const pointMap: Record<string, number[]> = {};

    // near

    addLine("n1", "n2");
    addLine("n2", "n4");
    addLine("n4", "n3");
    addLine("n3", "n1");

    // cone

    addLine("p", "n1");
    addLine("p", "n2");
    addLine("p", "n3");
    addLine("p", "n4");

    // up

    addLine("u1", "u2");
    addLine("u2", "u3");
    addLine("u3", "u1");

    // cross

    addLine("cn1", "cn2");
    addLine("cn3", "cn4");

    function addLine(a: string, b: string) {
      addPoint(a);
      addPoint(b);
    }

    function addPoint(id: string) {
      vertices.push(0, 0, 0);
      colors.push(0, 0, 0);

      if (pointMap[id] === undefined) {
        pointMap[id] = [];
      }

      pointMap[id].push(vertices.length / 3 - 1);
    }

    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));

    super(geometry, material);

    // @ts-expect-error - We forcibly change the type to be "CameraHelper".
    this.type = "CameraHelper";

    this.camera = camera;

    if (this.camera.updateProjectionMatrix) {
      this.camera.updateProjectionMatrix();
    }

    this.matrix = camera.matrixWorld;
    this.matrixAutoUpdate = false;
    this.pointMap = pointMap;
    this.update();

    // colors

    const colorFrustum = new Color(0xff_aa_00);
    const colorCone = new Color(0xff_00_00);
    const colorUp = new Color(0x00_aa_ff);
    const colorCross = new Color(0x33_33_33);

    this.setColors(colorFrustum, colorCone, colorUp, colorCross);
  }

  setColors(frustum: Color, cone: Color, up: Color, cross: Color) {
    const geometry = this.geometry;
    const colorAttribute = geometry.getAttribute("color");

    // near frustum

    colorAttribute.setXYZ(0, frustum.r, frustum.g, frustum.b);
    colorAttribute.setXYZ(1, frustum.r, frustum.g, frustum.b); // n1, n2
    colorAttribute.setXYZ(2, frustum.r, frustum.g, frustum.b);
    colorAttribute.setXYZ(3, frustum.r, frustum.g, frustum.b); // n2, n4
    colorAttribute.setXYZ(4, frustum.r, frustum.g, frustum.b);
    colorAttribute.setXYZ(5, frustum.r, frustum.g, frustum.b); // n4, n3
    colorAttribute.setXYZ(6, frustum.r, frustum.g, frustum.b);
    colorAttribute.setXYZ(7, frustum.r, frustum.g, frustum.b); // n3, n1

    // cone

    colorAttribute.setXYZ(8, cone.r, cone.g, cone.b);
    colorAttribute.setXYZ(9, cone.r, cone.g, cone.b); // f1, f2
    colorAttribute.setXYZ(10, cone.r, cone.g, cone.b);
    colorAttribute.setXYZ(11, cone.r, cone.g, cone.b); // f2, f4
    colorAttribute.setXYZ(12, cone.r, cone.g, cone.b);
    colorAttribute.setXYZ(13, cone.r, cone.g, cone.b); // f4, f3
    colorAttribute.setXYZ(14, cone.r, cone.g, cone.b);
    colorAttribute.setXYZ(15, cone.r, cone.g, cone.b); // f3, f1

    // up

    colorAttribute.setXYZ(16, up.r, up.g, up.b);
    colorAttribute.setXYZ(17, up.r, up.g, up.b); // n1, f1
    colorAttribute.setXYZ(18, up.r, up.g, up.b);
    colorAttribute.setXYZ(19, up.r, up.g, up.b); // n2, f2
    colorAttribute.setXYZ(20, up.r, up.g, up.b);
    colorAttribute.setXYZ(21, up.r, up.g, up.b); // n3, f3

    // cross

    colorAttribute.setXYZ(22, cross.r, cross.g, cross.b);
    colorAttribute.setXYZ(23, cross.r, cross.g, cross.b); // n4, f4
    colorAttribute.setXYZ(24, cross.r, cross.g, cross.b);
    colorAttribute.setXYZ(25, cross.r, cross.g, cross.b);

    colorAttribute.needsUpdate = true;
  }

  update() {
    const geometry = this.geometry;
    const pointMap = this.pointMap;

    const w = 1,
      h = 1;

    // we need just camera projection matrix inverse
    // world matrix must be identity

    _camera.projectionMatrixInverse.copy(this.camera.projectionMatrixInverse);

    // center / target

    setPoint("c", pointMap, geometry, _camera, 0, 0, -1);
    setPoint("t", pointMap, geometry, _camera, 0, 0, 1);

    // near

    setPoint("n1", pointMap, geometry, _camera, -w, -h, -1);
    setPoint("n2", pointMap, geometry, _camera, w, -h, -1);
    setPoint("n3", pointMap, geometry, _camera, -w, h, -1);
    setPoint("n4", pointMap, geometry, _camera, w, h, -1);

    // up

    setPoint("u1", pointMap, geometry, _camera, w * 0.7, h * 1.1, -1);
    setPoint("u2", pointMap, geometry, _camera, -w * 0.7, h * 1.1, -1);
    setPoint("u3", pointMap, geometry, _camera, 0, h * 2, -1);

    // cross

    setPoint("cn1", pointMap, geometry, _camera, -w, 0, -1);
    setPoint("cn2", pointMap, geometry, _camera, w, 0, -1);
    setPoint("cn3", pointMap, geometry, _camera, 0, -h, -1);
    setPoint("cn4", pointMap, geometry, _camera, 0, h, -1);

    geometry.getAttribute("position").needsUpdate = true;
  }

  dispose() {
    this.geometry.dispose();
    if ("dispose" in this.material) {
      this.material.dispose();
    }
  }
}

function setPoint(
  point: string,
  pointMap: Record<string, number[]>,
  geometry: BufferGeometry,
  camera: Camera,
  x: number,
  y: number,
  z: number,
) {
  _vector.set(x, y, z).unproject(camera);

  const points = pointMap[point];

  if (points !== undefined) {
    const position = geometry.getAttribute("position");

    for (let i = 0, l = points.length; i < l; i++) {
      position.setXYZ(points[i], _vector.x, _vector.y, _vector.z);
    }
  }
}

extend({ TriplexCameraHelper });
