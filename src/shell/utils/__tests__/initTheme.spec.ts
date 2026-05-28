import { describe, it, expect, vi, beforeEach } from "vitest";
import { initAppThemeByThemeQueryParam } from "../initTheme";
import { setGlobalThemeVariables } from "../../../shared/infrastructure/ui/utils/setGlobalThemeVariables";

const mockReplaceState = vi.fn();

vi.mock("../../../shared/infrastructure/ui/utils/setGlobalThemeVariables", () => ({
  setGlobalThemeVariables: vi.fn(),
}));

describe("initAppThemeByThemeQueryParam", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should extract query param theme, inject variables and scrub the URL completely from layout history", () => {
    vi.stubGlobal("window", {
      location: {
        search: "?theme=rickAndMorty",
        pathname: "/game",
      },
      history: {
        replaceState: mockReplaceState,
      },
    });

    initAppThemeByThemeQueryParam();

    expect(setGlobalThemeVariables).toHaveBeenCalledTimes(1);

    expect(mockReplaceState).toHaveBeenCalledWith(null, "", "/game");
  });

  it("should securely fallback to default theme without scrubbing anything if parameter is absent", () => {
    vi.stubGlobal("window", {
      location: {
        search: "",
        pathname: "/game",
      },
      history: {
        replaceState: mockReplaceState,
      },
    });

    initAppThemeByThemeQueryParam();

    expect(setGlobalThemeVariables).toHaveBeenCalledTimes(1);
    expect(mockReplaceState).not.toHaveBeenCalled();
  });
});
