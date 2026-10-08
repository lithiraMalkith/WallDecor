"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap-config";
import { Reveal } from "./reveal";
import type { Review } from "@/types";

interface CollectorVoiceProps {
  initialReviews?: Review[];
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "rev_00",
    customerName: "Nadeesha S.",
    rating: 5,
    comment:
      "It catches the light differently all day. The natural morning light reveals subtle knife ridges that change by sunset.",
    productName: "Quiet Contour",
    isVerifiedPurchase: true,
    isFeaturedHomepage: true,
    status: "approved",
    createdAt: "2026-09-15T10:00:00Z",
  },
  {
    id: "rev_01",
    customerName: "Ayesha Jayasuriya",
    rating: 5,
    comment:
      "The Golden Rise piece looks breathtaking on our living room wall! The texture and gold details catch the sunlight beautifully.",
    productName: "Golden Rise",
    isVerifiedPurchase: true,
    isFeaturedHomepage: true,
    status: "approved",
    createdAt: "2026-09-25T11:00:00Z",
  },
  {
    id: "rev_02",
    customerName: "Dr. Rohan Mendis",
    rating: 5,
    comment:
      "Ordered Quiet Contour for our clinic reception. Super clean lines, securely packed, and delivered on time. Highly recommended!",
    productName: "Quiet Contour",
    isVerifiedPurchase: true,
    isFeaturedHomepage: true,
    status: "approved",
    createdAt: "2026-09-28T14:30:00Z",
  },
  {
    id: "rev_03",
    customerName: "Keshini De Alwis",
    rating: 5,
    comment:
      "Loved having COD! Was hesitant ordering handmade art online but the piece exceeded expectations.",
    productName: "Ceylon Botanica",
    isVerifiedPurchase: true,
    isFeaturedHomepage: true,
    status: "approved",
    createdAt: "2026-10-01T09:15:00Z",
  },
];

const ROTATION_INTERVAL_MS = 6000; // Timely changing gap

export function CollectorVoice({ initialReviews }: CollectorVoiceProps) {
  const [reviews, setReviews] = useState<Review[]>(
    initialReviews && initialReviews.length > 0 ? initialReviews : DEFAULT_REVIEWS
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const quoteRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef(false);

  // Fetch live feedbacks from database API on mount
  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      try {
        const res = await fetch("/api/reviews?status=approved", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const approved: Review[] = json.data.filter(
            (r: Review) => r.status === "approved" || !r.status
          );
          if (approved.length > 0 && isMounted) {
            setReviews(approved);
          }
        }
      } catch (err) {
        console.warn("Could not fetch reviews for Collector Voice, using default.", err);
      }
    }
    loadReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  // Timely changing feedback with smooth GSAP effect
  useEffect(() => {
    if (reviews.length <= 1) return;

    const timer = setInterval(() => {
      if (isTransitioning.current || !quoteRef.current) return;
      isTransitioning.current = true;

      // GSAP smooth fade & drift out
      gsap.to(quoteRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.45,
        ease: "power2.in",
        onComplete: () => {
          setCurrentIndex((prev) => (prev + 1) % reviews.length);

          // GSAP smooth entrance
          if (quoteRef.current) {
            gsap.fromTo(
              quoteRef.current,
              { opacity: 0, y: 10 },
              {
                opacity: 1,
                y: 0,
                duration: 0.55,
                ease: "power2.out",
                onComplete: () => {
                  isTransitioning.current = false;
                },
              }
            );
          } else {
            isTransitioning.current = false;
          }
        },
      });
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [reviews.length]);

  const current = reviews[currentIndex] || reviews[0] || DEFAULT_REVIEWS[0];

  const authorLabel = current.id === "rev_00" || current.customerName.includes("Colombo 07")
    ? "Nadeesha S. · Verified Collector, Colombo 07"
    : `${current.customerName} · Verified Collector${current.productName ? `, ${current.productName}` : ""}`;

  return (
    <section className="bg-[#BA8E23] py-20 text-[#000000]">
      <Reveal className="container-x text-center">
        <p
          className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#000000] font-semibold"
          style={{ color: "#000000" }}
        >
          Collector Voice
        </p>

        <div ref={quoteRef}>
          <blockquote className="mx-auto mt-6 max-w-4xl text-2xl sm:text-4xl lg:text-5xl font-light leading-snug tracking-[-0.025em] text-[#000000]">
            &ldquo;{current.comment}&rdquo;
          </blockquote>

          <p
            className="mt-6 text-xs uppercase font-mono tracking-wider text-[#000000] font-medium"
            style={{ color: "#000000" }}
          >
            {authorLabel}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
