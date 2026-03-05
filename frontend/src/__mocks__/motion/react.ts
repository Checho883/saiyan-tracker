import React from 'react';

// Motion component mock: renders the HTML element directly
const motion = new Proxy({} as Record<string, React.FC<any>>, {
  get: (_target, prop: string) =>
    React.forwardRef(({ children, ...props }: any, ref: any) => {
      // Filter out motion-specific props that aren't valid HTML attributes
      const {
        initial: _initial,
        animate: _animate,
        exit: _exit,
        transition: _transition,
        variants: _variants,
        whileHover: _whileHover,
        whileTap: _whileTap,
        whileFocus: _whileFocus,
        whileDrag: _whileDrag,
        whileInView: _whileInView,
        layout: _layout,
        layoutId: _layoutId,
        onAnimationComplete: _onAnimationComplete,
        ...htmlProps
      } = props;
      return React.createElement(prop, { ...htmlProps, ref }, children);
    }),
});

// AnimatePresence: passthrough that renders children
function AnimatePresence({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

// MotionConfig: passthrough that renders children
function MotionConfig({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

// Hook mocks
function useAnimation() {
  return { start: () => Promise.resolve(), stop: () => {}, set: () => {} };
}

function useReducedMotion() {
  return false;
}

function useMotionValue(initial: number) {
  return { get: () => initial, set: () => {}, onChange: () => () => {} };
}

function useTransform(value: any, _input: number[], _output: number[]) {
  return value;
}

export {
  motion,
  AnimatePresence,
  MotionConfig,
  useAnimation,
  useReducedMotion,
  useMotionValue,
  useTransform,
};
