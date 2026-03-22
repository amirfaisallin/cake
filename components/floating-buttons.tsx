"use client"

import { MessageCircle } from "lucide-react"

export function FloatingButtons() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <a
        href="https://web.facebook.com/thecakecell/"
        target="_blank"
        rel="noopener noreferrer"
        className="w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-[#0084FF] text-white shadow-md hover:scale-105 transition-transform"
        aria-label="Message us on Messenger"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6 fill-current">
          <path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.913 1.454 5.512 3.726 7.21V22l3.405-1.869c.909.252 1.871.388 2.869.388 5.523 0 10-4.145 10-9.259S17.523 2 12 2zm.994 12.469l-2.545-2.717-4.969 2.717 5.466-5.801 2.608 2.717 4.906-2.717-5.466 5.801z"/>
        </svg>
      </a>

      <a
        href="https://wa.me/8801738205144?text=Hi!%20I%20want%20to%20order%20a%20cake"
        target="_blank"
        rel="noopener noreferrer"
        className="w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-[#25D366] text-white shadow-md hover:scale-105 transition-transform"
        aria-label="Order via WhatsApp"
      >
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
      </a>
    </div>
  )
}
