import { Heading } from "../../components/Heading";
import { Surface } from "../../components/Surface";
import { Paragraph } from "../../components/Paragraph";
import "./ErrorScreen.scss";

export function ErrorScreen() {
  return (
    <div className="error-screen">
      <Surface className="error-screen__content">
        <Heading type="h1" size="2xl">
          ¡Ups! Algo salió mal
        </Heading>

        <Paragraph size="lg">
          Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta recargar la página o vuelve a intentarlo más
          tarde.
        </Paragraph>
      </Surface>
    </div>
  );
}
