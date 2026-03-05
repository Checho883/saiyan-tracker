import { usePowerStore } from '../../store/powerStore';
import { AttributeBar } from './AttributeBar';

export function AttributeGrid() {
  const attributes = usePowerStore((s) => s.attributes);

  return (
    <div className="grid grid-cols-2 gap-3">
      {attributes.map((detail) => (
        <AttributeBar key={detail.attribute} detail={detail} />
      ))}
    </div>
  );
}
