import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { XpPopup } from '../components/dashboard/XpPopup';

describe('XpPopup negative variant (22-01)', () => {
  test('negative=true renders red text with minus prefix', () => {
    const { container } = render(
      <XpPopup amount={15} attribute="str" onDone={vi.fn()} negative={true} />
    );
    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
    expect(span?.textContent).toContain('-15');
    expect(span?.textContent).toContain('STR XP');
    expect(span?.className).toContain('text-danger');
  });

  test('negative=true uses xp-sink animation', () => {
    const { container } = render(
      <XpPopup amount={10} attribute="vit" onDone={vi.fn()} negative={true} />
    );
    const span = container.querySelector('span');
    expect(span?.style.animation).toContain('xp-sink');
  });

  test('negative=true positions at bottom', () => {
    const { container } = render(
      <XpPopup amount={10} attribute="int" onDone={vi.fn()} negative={true} />
    );
    const span = container.querySelector('span');
    expect(span?.className).toContain('-bottom-2');
  });

  test('default (negative=false) renders plus prefix with attribute color', () => {
    const { container } = render(
      <XpPopup amount={20} attribute="ki" onDone={vi.fn()} />
    );
    const span = container.querySelector('span');
    expect(span?.textContent).toContain('+20');
    expect(span?.textContent).toContain('KI XP');
    expect(span?.className).toContain('text-attr-ki');
    expect(span?.className).toContain('-top-2');
    expect(span?.style.animation).toContain('xp-float');
  });
});
