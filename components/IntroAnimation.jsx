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
    const gtpWrapper = document.getElementById("gtp-wrapper");
    const leapWrapper = document.getElementById("leap-wrapper");

    if (!gtpChars.length || !gtpWrapper || !leapWrapper) return;

    // --- 1. GIAI ĐOẠN GÕ ---
    gtpChars.forEach((char, index) => {
      tl.to(char, { opacity: 1, y: 0, duration: 0.08, ease: "none" });
    });

    if (leapChars.length) {
      leapChars.forEach((char, index) => {
        tl.to(char, { opacity: 1, y: 0, duration: 0.08, ease: "none" });
      });
    }

    // --- 2. GIAI ĐOẠN REVEAL ---
    tl.addLabel("startReveal");
    tl.to("#intro-overlay", { yPercent: -100, duration: 2.5, ease: "expo.inOut" }, "startReveal");

    tl.to(gtpWrapper, {
      x: "-47vw",
      y: "-47vh",
      scale: 1,
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
        #intro-text-container { transform: scale(1.2); transform-origin: center; }
        #gtp-wrapper { width: 45px; height: 20px; color: currentColor; z-index: 1001; overflow: visible; }
        #gtp-wrapper .gtp-char {
          opacity: 0;
          transform: translateY(4px);
          transform-box: fill-box;
          transform-origin: center;
        }
        #leap-wrapper { font-weight: 300; font-size: 12px; line-height: 1; text-transform: uppercase; margin-left: 10px; display: flex; }

        @media (min-width: 1024px) {
          #gtp-wrapper { width: 54px; height: 24px; }
          #leap-wrapper { font-size: 14px; margin-left: 12px; }
        }
      `}</style>

      <div id="intro-overlay" className="fixed inset-0 bg-black z-[1000] flex items-center justify-center overflow-hidden">
        <div id="intro-text-container" className="flex items-baseline text-white relative px-5 py-2">
          <svg id="gtp-wrapper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 216 97.08" className="shrink-0">
            <g className="gtp-char">
              <rect x="0" y="0" width="60" height="12" fill="currentColor" />
              <rect x="0" y="85.08" width="60" height="12" fill="currentColor" />
              <rect x="0" y="0" width="12" height="97.08" fill="currentColor" />
              <rect x="48" y="42.54" width="12" height="54.54" fill="currentColor" />
              <rect x="24" y="42.54" width="36" height="12" fill="currentColor" />
            </g>
            <g className="gtp-char">
              <rect x="78" y="0" width="60" height="12" fill="currentColor" />
              <rect x="102" y="0" width="12" height="97.08" fill="currentColor" />
            </g>
            <g className="gtp-char">
              <rect x="156" y="0" width="60" height="12" fill="currentColor" />
              <rect x="156" y="42.54" width="60" height="12" fill="currentColor" />
              <rect x="156" y="0" width="12" height="97.08" fill="currentColor" />
              <rect x="204" y="0" width="12" height="54.54" fill="currentColor" />
            </g>
          </svg>
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
