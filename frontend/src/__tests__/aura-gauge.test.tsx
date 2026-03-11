import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuraGauge } from '../components/dashboard/AuraGauge';

describe('AuraGauge (05-02)', () => {
  test('renders gauge at 0%', () => {
    render(<AuraGauge percent={0} tier="base" />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  test('renders gauge at 50%', () => {
    render(<AuraGauge percent={50} tier="kaioken_x3" />);
    expect(screen.getByText('50%')).toBeInTheDocument();
    // SVG circle should have non-zero progress
    const progressCircle = document.querySelector('[data-testid="aura-progress"]');
    expect(progressCircle).toBeInTheDocument();
  });

  test('tier label base shows no tier text', () => {
    render(<AuraGauge percent={30} tier="base" />);
    expect(screen.queryByText('Kaio-ken')).not.toBeInTheDocument();
  });

  test('tier label kaioken_x3 shows correct text', () => {
    render(<AuraGauge percent={50} tier="kaioken_x3" />);
    expect(screen.getByText('Kaio-ken x3')).toBeInTheDocument();
  });

  test('tier label kaioken_x10 shows correct text', () => {
    render(<AuraGauge percent={80} tier="kaioken_x10" />);
    expect(screen.getByText('Kaio-ken x10')).toBeInTheDocument();
  });

  test('tier label kaioken_x20 shows correct text', () => {
    render(<AuraGauge percent={100} tier="kaioken_x20" />);
    expect(screen.getByText('Kaio-ken x20')).toBeInTheDocument();
  });

  test('progress circle transition is 500ms', () => {
    render(<AuraGauge percent={50} tier="base" />);
    const progressCircle = document.querySelector('[data-testid="aura-progress"]') as SVGElement;
    expect(progressCircle).toBeInTheDocument();
    expect(progressCircle.style.transition).toContain('500ms');
  });
});
