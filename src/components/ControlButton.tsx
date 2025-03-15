type ControlButtonProps = {
  onClick: () => void;
  Icon: React.ElementType;
};
export const ControlButton = (props: ControlButtonProps) => {
  return (
    <button
      onClick={props.onClick}
      className="bg-gray-500 opacity-90 p-3 rounded-full hover:opacity-100 transition"
    >
      <props.Icon className="text-white" />
    </button>
  );
};
