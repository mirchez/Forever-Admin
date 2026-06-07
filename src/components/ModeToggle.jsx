import { usePreset } from "../context/PresetContext";

const ModeToggle = () => {
  const { preset, otherPreset, toggleMode } = usePreset();
  return (
    <button
      onClick={toggleMode}
      title={`Cambiar a modo ${otherPreset.label}`}
      className="text-xl leading-none px-2 py-1 rounded hover:bg-gray-100 transition cursor-pointer"
      aria-label={`Cambiar a modo ${otherPreset.label}`}
    >
      {preset.toggleLabel}
    </button>
  );
};

export default ModeToggle;
