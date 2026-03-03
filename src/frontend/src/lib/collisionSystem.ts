export interface AABB {
  x: number;
  z: number;
  width: number;
  depth: number;
}

export interface Circle {
  x: number;
  z: number;
  radius: number;
}

export function aabbOverlap(a: AABB, b: AABB): boolean {
  return (
    a.x - a.width / 2 < b.x + b.width / 2 &&
    a.x + a.width / 2 > b.x - b.width / 2 &&
    a.z - a.depth / 2 < b.z + b.depth / 2 &&
    a.z + a.depth / 2 > b.z - b.depth / 2
  );
}

export function circleAABBOverlap(circle: Circle, box: AABB): boolean {
  const nearestX = Math.max(
    box.x - box.width / 2,
    Math.min(circle.x, box.x + box.width / 2),
  );
  const nearestZ = Math.max(
    box.z - box.depth / 2,
    Math.min(circle.z, box.z + box.depth / 2),
  );
  const dx = circle.x - nearestX;
  const dz = circle.z - nearestZ;
  return dx * dx + dz * dz < circle.radius * circle.radius;
}

export function circleOverlap(a: Circle, b: Circle): boolean {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  return dist < a.radius + b.radius;
}

export function resolveAABBCollision(
  pos: { x: number; z: number },
  radius: number,
  obstacle: AABB,
): { x: number; z: number } {
  const circle: Circle = { x: pos.x, z: pos.z, radius };
  if (!circleAABBOverlap(circle, obstacle)) return pos;

  const overlapLeft = pos.x + radius - (obstacle.x - obstacle.width / 2);
  const overlapRight = obstacle.x + obstacle.width / 2 - (pos.x - radius);
  const overlapTop = pos.z + radius - (obstacle.z - obstacle.depth / 2);
  const overlapBottom = obstacle.z + obstacle.depth / 2 - (pos.z - radius);

  const minOverlap = Math.min(
    overlapLeft,
    overlapRight,
    overlapTop,
    overlapBottom,
  );

  let newX = pos.x;
  let newZ = pos.z;

  if (minOverlap === overlapLeft)
    newX = obstacle.x - obstacle.width / 2 - radius;
  else if (minOverlap === overlapRight)
    newX = obstacle.x + obstacle.width / 2 + radius;
  else if (minOverlap === overlapTop)
    newZ = obstacle.z - obstacle.depth / 2 - radius;
  else newZ = obstacle.z + obstacle.depth / 2 + radius;

  return { x: newX, z: newZ };
}

export function lineIntersectsAABB(
  x1: number,
  z1: number,
  x2: number,
  z2: number,
  box: AABB,
): boolean {
  const minX = box.x - box.width / 2;
  const maxX = box.x + box.width / 2;
  const minZ = box.z - box.depth / 2;
  const maxZ = box.z + box.depth / 2;

  const dx = x2 - x1;
  const dz = z2 - z1;

  let tMin = 0;
  let tMax = 1;

  if (Math.abs(dx) < 1e-9) {
    if (x1 < minX || x1 > maxX) return false;
  } else {
    const t1 = (minX - x1) / dx;
    const t2 = (maxX - x1) / dx;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  }

  if (Math.abs(dz) < 1e-9) {
    if (z1 < minZ || z1 > maxZ) return false;
  } else {
    const t1 = (minZ - z1) / dz;
    const t2 = (maxZ - z1) / dz;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  }

  return tMin <= tMax;
}
