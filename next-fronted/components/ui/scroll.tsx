import React, { useEffect, useRef, useState } from "react";

const MyScrollShadow = ({
  children,
  hideScrollBar,
  className,
}: {
  children: any;
  hideScrollBar: any;
  className: any;
}) => {
  const scrollRef = useRef(null);
  const scrollPositionKey = "scrollPosition";
  const [scrollTop, setScrollTop] = useState(false);
  const [scrollBottom, setScrollBottom] = useState(false);

  // 从 localStorage 中获取上次的滑动位置
  const getScrollPosition = () => {
    const position = localStorage.getItem(scrollPositionKey);

    return position ? parseInt(position, 10) : 0;
  };

  // 保存当前滑动位置到 localStorage
  const saveScrollPosition = () => {
    if (scrollRef.current) {
      localStorage.setItem(
        scrollPositionKey,
        (scrollRef.current as any).scrollTop,
      );
    }
  };

  useEffect(() => {
    const savedPosition = getScrollPosition();

    if (scrollRef.current) {
      (scrollRef.current as any).scrollTop = savedPosition;
    }

    // 添加事件监听以保存滑动位置
    const handleScroll = () => {
      saveScrollPosition();
      isTopScroll();
      isBottomScroll();
    };

    const currentRef = scrollRef.current as any;

    currentRef.addEventListener("scroll", handleScroll);

    // 清理事件监听
    return () => {
      currentRef.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isTopScroll = () => {
    const currentRef = scrollRef.current as any;

    console.log(
      "currentRef.scrollTop",
      currentRef ? currentRef.scrollTop : null,
    );
    setScrollTop(currentRef ? currentRef.scrollTop > 0 : false);
  };

  const isBottomScroll = () => {
    const currentRef = scrollRef.current as any;

    setScrollBottom(
      currentRef
        ? currentRef.scrollTop <
            currentRef.scrollHeight - currentRef.clientHeight
        : false,
    );
  };

  // const isTopBottomScroll = () => {
  //   return isTopScroll() && isBottomScroll();
  // };

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
};

export default MyScrollShadow;
