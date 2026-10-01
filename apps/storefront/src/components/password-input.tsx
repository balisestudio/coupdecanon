import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@coupdecanon/ui/components/input-group";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { type ComponentProps, useState } from "react";

/** A password's input, with a button at its end to show what was typed, and hide it again. */
export function PasswordInput({ className, ...props }: Omit<ComponentProps<"input">, "type">) {
  const [shown, setShown] = useState(false);
  return (
    <InputGroup className={className}>
      <InputGroupInput type={shown ? "text" : "password"} spellCheck={false} {...props} />
      <InputGroupAddon>
        <InputGroupButton
          aria-label={shown ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={shown}
          onClick={() => setShown((current) => !current)}
        >
          {shown ? (
            <EyeOffIcon aria-hidden="true" className="size-4" />
          ) : (
            <EyeIcon aria-hidden="true" className="size-4" />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
