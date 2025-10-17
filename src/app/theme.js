import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  // Brand palette and semantic tokens aligned with globals.scss
  colors: {
    brand: {
      50: "#ffe5ea",
      100: "#ffccd5",
      200: "#ff99ab",
      300: "#ff6680",
      400: "#f03d5c",
      500: "#d91b3f",
      600: "#bc0930", // primary
      700: "#9a0727",
      800: "#78051e",
      900: "#560315",
    },
  },
  semanticTokens: {
    colors: {
      "bg.canvas": {
        default: "#fffcf2",
      },
      "text.muted": {
        default: "#5B6B73",
      },
      "border.muted": {
        default: "#EFEFEF",
      },
      link: {
        default: "#bc0930",
      },
    },
  },
  styles: {
    global: {
      html: {
        backgroundColor: "#fffcf2",
      },
      body: {
        backgroundColor: "#fffcf2",
      },
      a: {
        color: "link",
      },
    },
  },
  components: {
    Input: {
      defaultProps: {
        focusBorderColor: "brand.600",
      },
    },
    Select: {
      defaultProps: {
        focusBorderColor: "brand.600",
      },
    },
    Textarea: {
      defaultProps: {
        focusBorderColor: "brand.600",
      },
    },
    Checkbox: {
      baseStyle: {
        control: {
          _checked: {
            bg: "brand.600",
            borderColor: "brand.600",
            _hover: { bg: "brand.700" },
          },
        },
      },
    },
    Button: {
      variants: {
        brand: {
          bg: "brand.600",
          color: "white",
          _hover: { bg: "brand.700" },
          _active: { bg: "brand.800" },
        },
      },
    },
  },
});

export default theme;
