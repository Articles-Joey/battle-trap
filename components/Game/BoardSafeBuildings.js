import { useLayoutEffect, useRef } from "react";
import { Box3, Vector3 } from "three";

// Keep the entire building footprint outside the board, not just its origin.
export default function BoardSafeBuildings({ boardSize, direction, children }) {
    const groupRef = useRef();
    const [sideX, sideZ] = direction;

    useLayoutEffect(() => {
        const group = groupRef.current;
        if (!group) return;

        // Reset the previous correction when the board changes size.
        group.position.set(0, 0, 0);
        group.updateWorldMatrix(true, true);
        const bounds = new Box3().setFromObject(group);
        if (bounds.isEmpty()) return;

        // GameGrid uses two-unit cells, rotated and translated by GameCanvas.
        // Its world-space edges on both X and Z are -boardSize-1 .. boardSize-1.
        const clearance = 2;
        const min = -boardSize - 1 - clearance;
        const max = boardSize - 1 + clearance;
        const offset = (side, low, high) =>
            side > 0 ? Math.max(0, max - low)
                : side < 0 ? Math.min(0, min - high) : 0;

        const origin = group.getWorldPosition(new Vector3());
        origin.x += offset(sideX, bounds.min.x, bounds.max.x);
        origin.z += offset(sideZ, bounds.min.z, bounds.max.z);
        // Convert the world-space correction into the parent's coordinates.
        if (group.parent) group.parent.worldToLocal(origin);
        group.position.copy(origin);
        group.updateWorldMatrix(false, true);
    }, [boardSize, sideX, sideZ]);

    return <group ref={groupRef}>{children}</group>;
}
