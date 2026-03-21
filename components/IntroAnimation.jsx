"use client";

import { useEffect } from "react";
import gsap from "gsap";

export default function IntroAnimation() {
  useEffect(() => {
    // Khóa cuộn màn hình bằng Javascript Event, KHÔNG dùng overflow: hidden 
    // để thanh Scrollbar luôn hiển thị ngay từ đầu, tránh hiện tượng giật cục Layout Shift
    const preventScroll = (e) => {
      e.preventDefault();
      window.scrollTo(0, 0);
    };
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });

    const tl = gsap.timeline();
    const gtpChars = document.querySelectorAll(".gtp-char");
    const leapChars = document.querySelectorAll(".leap-char");
    const cursor = document.getElementById("cursor");
    const gtpWrapper = document.getElementById("gtp-wrapper");
    const leapWrapper = document.getElementById("leap-wrapper");

    if (!gtpChars.length || !cursor || !gtpWrapper || !leapWrapper) return;

    tl.set(cursor, { x: gtpChars[0]?.offsetLeft || 0 });

    // --- 1. GIAI ĐOẠN GÕ ---
    gtpChars.forEach((char, index) => {
      tl.to(char, { opacity: 1, y: 0, duration: 0.08, ease: "none" });
      const nextPos = gtpChars[index + 1]
        ? gtpChars[index + 1].offsetLeft
        : gtpChars[index].offsetLeft + gtpChars[index].offsetWidth;
      tl.to(cursor, { x: nextPos, duration: 0.08, ease: "none" }, "<");
    });

    if (leapChars.length) {
      tl.to(cursor, { x: leapChars[0].offsetLeft, duration: 0.1 });

      leapChars.forEach((char, index) => {
        tl.to(char, { opacity: 1, y: 0, duration: 0.08, ease: "none" });
        const nextPos = leapChars[index + 1]
          ? leapChars[index + 1].offsetLeft
          : leapChars[index].offsetLeft + leapChars[index].offsetWidth;
        tl.to(cursor, { x: nextPos, duration: 0.08, ease: "none" }, "<");
      });
    }

    // --- 2. GIAI ĐOẠN REVEAL ---
    tl.addLabel("startReveal");
    tl.to(cursor, { opacity: 0, duration: 0.2 }, "startReveal");
    tl.to("#intro-overlay", { yPercent: -100, duration: 2.5, ease: "expo.inOut" }, "startReveal");

    tl.to(gtpWrapper, {
      x: "-42vw",
      y: "-44vh",
      scale: 0.35,
      color: "#000",
      duration: 2.5,
      ease: "expo.inOut",
    }, "startReveal");

    tl.to(leapWrapper, {
      width: "90vw",
      x: "5vw",
      justifyContent: "space-between",
      duration: 2.2,
      ease: "expo.inOut",
    }, "startReveal");

    tl.to(leapChars, {
      opacity: 0,
      x: (i) => (i - 1.5) * 100,
      filter: "blur(15px)",
      duration: 1.8,
      ease: "power2.inOut",
    }, "startReveal+=0.2");

    tl.set(gtpWrapper, {
      position: "fixed",
      top: "25px",
      left: "35px",
      x: 0,
      y: 0,
      margin: 0,
    });

    // Giải phóng scroll sau khi hoàn tất
    tl.eventCallback("onComplete", () => {
      window.removeEventListener("wheel", preventScroll, { passive: false });
      window.removeEventListener("touchmove", preventScroll, { passive: false });
      gsap.to(gtpWrapper, { opacity: 0, duration: 1.5 }); // Fade out intro GTP text so real SVG logo takes over seamlessly
      window.dispatchEvent(new CustomEvent("introAnimationComplete"));
      window.dispatchEvent(new Event("introAnimationComplete"));
    });

    // Dispatch introStarted event immediately when intro begins
    window.dispatchEvent(new CustomEvent("introStarted"));

    return () => {
      window.removeEventListener("wheel", preventScroll, { passive: false });
      window.removeEventListener("touchmove", preventScroll, { passive: false });
      tl.kill();
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        .char {
          display: inline-block;
          opacity: 0;
          transform: translateY(4px);
          white-space: pre;
        }
        #gtp-wrapper { font-weight: 700; font-size: 4rem; line-height: 1; text-transform: uppercase; z-index: 1001; }
        #leap-wrapper { font-weight: 300; font-size: 2rem; line-height: 1; text-transform: uppercase; margin-left: 20px; display: flex; }
        #cursor { width: 3px; height: 3.2rem; background-color: #fff; position: absolute; left: 0; bottom: 12%; z-index: 10; }
      `}</style>

      <div id="intro-overlay" className="fixed inset-0 bg-black z-[1000] flex items-center justify-center overflow-hidden">
        <div id="intro-text-container" className="flex items-baseline text-white relative px-5 py-2">
          <div id="cursor"></div>
          <div id="gtp-wrapper">
            <span className="char gtp-char">G</span>
            <span className="char gtp-char">T</span>
            <span className="char gtp-char">P</span>
          </div>
          <div id="leap-wrapper">
            <span className="char leap-char">L</span>
            <span className="char leap-char">E</span>
            <span className="char leap-char">A</span>
            <span className="char leap-char">P</span>
          </div>
        </div>
      </div>
    </>
  );
}
