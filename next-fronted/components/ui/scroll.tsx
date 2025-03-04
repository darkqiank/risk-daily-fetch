import React, { useEffect, useRef, useState } from "react";

const MyScrollShadow = React.forwardRef(
  (
    {
      children,
      hideScrollBar,
      className,
    }: {
      children: any;
      hideScrollBar: any;
      className: any;
    },
    ref,
  ) => {
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const scrollPositionKey = "scrollPosition";
    const [scrollTop, setScrollTop] = useState(false);
    const [scrollBottom, setScrollBottom] = useState(false);

    // 获取上次的滑动位置
    const getScrollPosition = () => {
      const position = localStorage.getItem(scrollPositionKey);

      return position ? parseInt(position, 10) : 0;
    };

    // 保存当前滑动位置
    const saveScrollPosition = () => {
      if (scrollRef.current) {
        localStorage.setItem(
          scrollPositionKey,
          scrollRef.current.scrollTop.toString(),
        );
      }
    };

    useEffect(() => {
      const savedPosition = getScrollPosition();

      if (scrollRef.current) {
        scrollRef.current.scrollTop = savedPosition;
      }

      const handleScroll = () => {
        saveScrollPosition();
        isTopScroll();
        isBottomScroll();
      };

      const currentRef = scrollRef.current;

      currentRef?.addEventListener("scroll", handleScroll);

      return () => {
        currentRef?.removeEventListener("scroll", handleScroll);
      };
    }, []);

    const isTopScroll = () => {
      if (!scrollRef.current) return;
      setScrollTop(scrollRef.current.scrollTop > 0);
    };

    const isBottomScroll = () => {
      if (!scrollRef.current) return;
      setScrollBottom(
        scrollRef.current.scrollTop <
          scrollRef.current.scrollHeight - scrollRef.current.clientHeight,
      );
    };

    // 添加 `scrollToTop` 方法
    React.useImperativeHandle(ref, () => ({
      scrollToTop: () => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }
      },
    }));

    return (
      <div
        ref={scrollRef}
        className={`${className} overflow-y-auto ${hideScrollBar ? "scrollbar-hide" : ""} 
        data-[top-bottom-scroll=true]:[mask-image:linear-gradient(transparent_0px,#000_40px,#000_calc(100%_-_40px),transparent)] 
        data-[bottom-scroll=true]:[mask-image:linear-gradient(0deg,#000_calc(100%_-_40px),transparent)]
        data-[top-scroll=true]:[mask-image:linear-gradient(180deg,#000_calc(100%_-_40px),transparent)]
        `}
        data-bottom-scroll={!scrollBottom}
        data-orientation="vertical"
        data-top-bottom-scroll={scrollBottom && scrollTop}
        data-top-scroll={!scrollTop}
      >
        {children}
      </div>
    );
  },
);

MyScrollShadow.displayName = "MyScrollShadow";

export default MyScrollShadow;
