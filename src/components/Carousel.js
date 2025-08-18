"use client";

import { useRef } from "react";
import { Box, HStack, IconButton, useBreakpointValue } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Carousel({ children, itemMinWidth = 240, gap = 12 }) {
  const containerRef = useRef(null);
  const showArrows = useBreakpointValue({ base: true, md: false });

  const scrollByAmount = () => {
    try {
      const el = containerRef.current;
      if (!el) return 0;
      const firstChild = el.querySelector("[data-slide]");
      const width = firstChild
        ? firstChild.getBoundingClientRect().width
        : itemMinWidth;
      return width + gap;
    } catch {
      return itemMinWidth + gap;
    }
  };

  return (
    <Box position="relative">
      {showArrows && (
        <IconButton
          aria-label="Prev"
          icon={<ChevronLeft size={18} />}
          size="sm"
          variant="ghost"
          position="absolute"
          top="50%"
          left={-2}
          transform="translateY(-50%)"
          onClick={() =>
            containerRef.current?.scrollBy({
              left: -scrollByAmount(),
              behavior: "smooth",
            })
          }
        />
      )}

      <HStack
        ref={containerRef}
        spacing={`${gap}px`}
        overflowX="auto"
        py={1}
        sx={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        {Array.isArray(children) ? (
          children.map((child, idx) => (
            <Box
              key={idx}
              data-slide
              minW={
                typeof itemMinWidth === "number"
                  ? `${itemMinWidth}px`
                  : itemMinWidth
              }
              flexShrink={0}
              scrollSnapAlign="start"
            >
              {child}
            </Box>
          ))
        ) : (
          <Box
            data-slide
            minW={
              typeof itemMinWidth === "number"
                ? `${itemMinWidth}px`
                : itemMinWidth
            }
            flexShrink={0}
            scrollSnapAlign="start"
          >
            {children}
          </Box>
        )}
      </HStack>

      {showArrows && (
        <IconButton
          aria-label="Next"
          icon={<ChevronRight size={18} />}
          size="sm"
          variant="ghost"
          position="absolute"
          top="50%"
          right={-2}
          transform="translateY(-50%)"
          onClick={() =>
            containerRef.current?.scrollBy({
              left: scrollByAmount(),
              behavior: "smooth",
            })
          }
        />
      )}
    </Box>
  );
}
