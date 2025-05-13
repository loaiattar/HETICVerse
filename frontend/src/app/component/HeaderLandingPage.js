import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Header() {
  const headerRef = useRef(null);
  const logoContainerRef = useRef(null);
  const letterHRef = useRef(null);
  const letterVRef = useRef(null);
  const letterDotRef = useRef(null);
  
  // Références individuelles pour chaque lettre de "ETIC"
  const letterERef = useRef(null);
  const letterTRef = useRef(null);
  const letterIRef = useRef(null);
  const letterCRef = useRef(null);
  
  const hiddenVerseRef = useRef(null);
  
  useEffect(() => {
    // Store references for cleanup
    const headerElement = headerRef.current;
    
    // Timeline for animation
    const tl = gsap.timeline({
      onComplete: () => {
        // Reduce header height after animation completes
        gsap.to(headerElement, {
          height: '0vh',
          duration: 1.5,
          delay: 1,
          ease: 'power2.inOut'
        });

        gsap.to([letterHRef.current, letterERef.current, letterTRef.current, letterIRef.current, letterCRef.current, letterVRef.current, letterDotRef.current, hiddenVerseRef.current], {
            y: '-500',
            duration: 3,
            delay: 1,
            ease: 'back.inOut'
          });
      }
    });
    
    // Animation sequence:
    tl
      // Initial setup - position all elements and hide what needs to be hidden
      .set([letterERef.current, letterTRef.current, letterIRef.current, letterCRef.current], { opacity: 0 })
      .set(hiddenVerseRef.current, { opacity: 0 })
      .set(letterHRef.current, { x: 135 })
      .set(letterVRef.current, { x: -25 })
      .set(letterDotRef.current, { x: -175 })
      .set(hiddenVerseRef.current, { x: 30 })
      .from(logoContainerRef.current, { opacity: 0, scale: 0.8, duration: 1, ease: "back.out(1.7)" })
      
      // Phase 1 - Toutes les animations, y compris l'apparition des lettres
      .addLabel("phase1")
      // Animations du logo
      .to(letterVRef.current, {
        x: 5,
        duration: 0.4,
        ease: "back.inOut"
      }, "phase1")
      .to(letterHRef.current, {
        x: 0,
        duration: 0.5,
        ease: "back.inOut"
      }, "phase1")
      .to(letterDotRef.current, {
        x: -150,
        duration: 0.4,
        ease: "back.inOut"
      }, "phase1")

      // Animation séquentielle des lettres de "ETIC" dans l'ordre C, I, T, E
      // toutes les animations commencent au même moment que les autres animations de la phase1
      .to(letterCRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: "back.inOut"
      }, "phase1") // Commence en même temps que les autres animations de phase1
      .to(letterIRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: "back.inOut"
      }, "phase1+=0.075") // Délai de 0.15s après le début de phase1
      .to(letterTRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: "back.inOut"
      }, "phase1+=0.1") // Délai de 0.3s après le début de phase1
      .to(letterERef.current, {
        opacity: 1,
        duration: 0.4,
        ease: "back.inOut"
      }, "phase1+=0.125") // Délai de 0.45s après le début de phase1
      





      // Deuxième groupe d'animations (simultanées)
      .addLabel("phase2", "+=1")
      .to(letterDotRef.current, {
        opacity: 0,
        duration: 0.1,
        ease: "back.inOut"
      }, "phase2")
      .to(hiddenVerseRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.15,
        ease: 'back.inOut'
      }, "phase2");
    
    // Cleanup function
    return () => {
      tl.kill();
    };
  }, []);
  
  return (
    <header 
      ref={headerRef} 
      className="header flex items-center justify-center h-screen bg-[#121212] transition-all duration-1000"
    >
      <div ref={logoContainerRef} className="relative">
        <div className="flex items-end">
          <span ref={letterHRef} className="text-[#3FDEE1] text-7xl font-bold leading-none">H</span>
          {/* Remplacer le span unique par des spans individuels pour chaque lettre */}
          <span ref={letterERef} className="text-[#3FDEE1] text-7xl font-bold leading-none">E</span>
          <span ref={letterTRef} className="text-[#3FDEE1] text-7xl font-bold leading-none">T</span>
          <span ref={letterIRef} className="text-[#3FDEE1] text-7xl font-bold leading-none">I</span>
          <span ref={letterCRef} className="text-[#3FDEE1] text-7xl font-bold leading-none">C</span>
          {/* Pas d'espace entre ETIC et V pour former un logo compact */}
          <span ref={letterVRef} className="text-white text-7xl font-bold leading-none ml-[-5px]">V</span>
          <span ref={hiddenVerseRef} className="text-white text-7xl font-bold leading-none">erse</span>
          {/* Pas d'espace entre V et . pour former un logo compact */}
          <span ref={letterDotRef} className="text-white text-7xl font-bold leading-none">.</span>
        </div>
      </div>
    </header>
  );
}