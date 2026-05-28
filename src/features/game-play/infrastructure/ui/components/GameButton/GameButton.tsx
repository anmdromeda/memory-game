import { inMemoryEventBus } from "../../../../../../shared/infrastructure/bus/InMemoryEventBus";
import { Button, type ButtonProps } from "../../../../../../shared/infrastructure/ui/components/Button";
import type { GameButtonAction } from "../../../../domain/models/GameSession";


export function GameButton({ onClick, action, ...props }: ButtonProps & { action: GameButtonAction }) {
  function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (!action?.trim() || !onClick) return;
    onClick(event);
    inMemoryEventBus.emit("game-play:button-pressed", { action });
  }

  return (
    <Button {...props} onClick={handleClick}>
      {props.children}
    </Button>
  );
}
