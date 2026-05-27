import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type CollectionTargetKey = "cart" | "wishlist";

interface FlyAnimationOptions {
  imageSrc: string;
  sourceRect: DOMRect;
  target: CollectionTargetKey;
}

interface ActiveAnimation {
  id: number;
  imageSrc: string;
  sourceRect: DOMRect;
  targetRect: DOMRect;
  target: CollectionTargetKey;
  targetScale: number;
}

interface CollectionAnimationContextValue {
  animateProductToTarget: (options: FlyAnimationOptions) => Promise<void>;
  registerTarget: (target: CollectionTargetKey, node: HTMLElement | null) => void;
}

const CollectionAnimationContext = createContext<
  CollectionAnimationContextValue | undefined
>(undefined);

const ANIMATION_DURATION_MS = 1050;

const getTargetSize = (target: CollectionTargetKey, targetNode: HTMLElement, targetRect: DOMRect) => {
  const fontSize = Number.parseFloat(window.getComputedStyle(targetNode).fontSize || "0");

  if (target === "cart" || target === "wishlist") {
    return Math.max(fontSize * 1.45, 12);
  }

  return Math.max(targetRect.width, targetRect.height);
};

export const CollectionAnimationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const targetsRef = useRef<Partial<Record<CollectionTargetKey, HTMLElement>>>({});
  const [animations, setAnimations] = useState<ActiveAnimation[]>([]);

  const registerTarget = useCallback((target: CollectionTargetKey, node: HTMLElement | null) => {
    targetsRef.current[target] = node ?? undefined;
  }, []);

  const animateProductToTarget = useCallback(
    async ({ imageSrc, sourceRect, target }: FlyAnimationOptions) => {
      const targetNode = targetsRef.current[target];
      if (!targetNode) {
        return;
      }

      const targetRect = targetNode.getBoundingClientRect();
      const targetSize = getTargetSize(target, targetNode, targetRect);
      const targetScale = targetSize / Math.max(sourceRect.width, sourceRect.height);
      const id = Date.now() + Math.random();

      setAnimations((current) => [
        ...current,
        {
          id,
          imageSrc,
          sourceRect,
          targetRect,
          target,
          targetScale,
        },
      ]);

      await new Promise<void>((resolve) => {
        window.setTimeout(() => {
          setAnimations((current) => current.filter((animation) => animation.id !== id));
          resolve();
        }, ANIMATION_DURATION_MS);
      });
    },
    [],
  );

  const value = useMemo<CollectionAnimationContextValue>(
    () => ({
      registerTarget,
      animateProductToTarget,
    }),
    [animateProductToTarget, registerTarget],
  );

  return (
    <CollectionAnimationContext.Provider value={value}>
      {children}
      {animations.map((animation) => {
        const targetSize =
          animation.target === "cart" || animation.target === "wishlist"
            ? Math.max(animation.targetRect.height * 0.66, 12)
            : Math.max(animation.targetRect.width, animation.targetRect.height);
        const targetX = animation.targetRect.left + animation.targetRect.width / 2 - targetSize / 2;
        const targetY = animation.targetRect.top + animation.targetRect.height / 2 - targetSize / 2;

        return (
          <img
            key={animation.id}
            src={animation.imageSrc}
            alt=""
            aria-hidden="true"
            style={{
              position: "fixed",
              left: animation.sourceRect.left,
              top: animation.sourceRect.top,
              width: animation.sourceRect.width,
              height: animation.sourceRect.height,
              objectFit: "cover",
              borderRadius: "20px",
              transformOrigin: "top left",
              pointerEvents: "none",
              zIndex: 2000,
              boxShadow: "0 20px 50px rgba(15, 23, 42, 0.28)",
              animation: `productFlyToCollection ${ANIMATION_DURATION_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
              ["--product-fly-target-x" as string]: `${targetX - animation.sourceRect.left}px`,
              ["--product-fly-target-y" as string]: `${targetY - animation.sourceRect.top}px`,
              ["--product-fly-target-scale" as string]: String(animation.targetScale),
            }}
          />
        );
      })}
      <style>
        {`
          @keyframes productFlyToCollection {
            0% {
              transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
              opacity: 1;
            }

            65% {
              opacity: 1;
            }

            100% {
              transform: translate3d(var(--product-fly-target-x), var(--product-fly-target-y), 0) scale(var(--product-fly-target-scale)) rotate(-8deg);
              opacity: 0.2;
            }
          }
        `}
      </style>
    </CollectionAnimationContext.Provider>
  );
};

export const useCollectionAnimation = () => {
  const context = useContext(CollectionAnimationContext);
  if (!context) {
    throw new Error("useCollectionAnimation must be used within CollectionAnimationProvider");
  }

  return context;
};
