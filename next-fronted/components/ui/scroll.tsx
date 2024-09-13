import React, { useEffect, useRef } from "react";

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
    };

    const currentRef = scrollRef.current as any;

    currentRef.addEventListener("scroll", handleScroll);

    // 清理事件监听
    return () => {
      currentRef.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      ref={scrollRef}
      className={`${className} overflow-y-auto ${hideScrollBar ? "scrollbar-hide" : ""} 
       [mask-image:linear-gradient(#000,#000,transparent_0,#000_40px,#000_calc(100%_-_40px),transparent)] `}
      //   [mask-image:linear-gradient(0deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]
      //   [mask-image:linear-gradient(180deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]
      style={{
        position: "relative",
      }}
    >
      {children}
    </div>
  );
};

export default MyScrollShadow;
