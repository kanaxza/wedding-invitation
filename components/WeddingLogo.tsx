interface WeddingLogoProps {
  className?: string;
}

export function WeddingLogo({ className = '' }: WeddingLogoProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      {/* Decorative Frame */}
      <circle
        cx="100"
        cy="100"
        r="95"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.3"
      />
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.2"
      />

      {/* Top Floral Decoration */}
      <path
        d="M100,30 Q90,35 85,40 Q80,35 75,40 Q85,45 90,50 Q95,45 100,50 Q105,45 110,50 Q115,45 125,40 Q120,35 115,40 Q110,35 100,30 Z"
        opacity="0.6"
      />

      {/* Bottom Floral Decoration */}
      <path
        d="M100,170 Q90,165 85,160 Q80,165 75,160 Q85,155 90,150 Q95,155 100,150 Q105,155 110,150 Q115,155 125,160 Q120,165 115,160 Q110,165 100,170 Z"
        opacity="0.6"
      />

      {/* Left Branch */}
      <path
        d="M40,100 Q45,95 50,95 L55,100 Q50,105 45,105 Q40,105 40,100"
        opacity="0.5"
      />
      <circle cx="35" cy="100" r="3" opacity="0.5" />
      
      {/* Right Branch */}
      <path
        d="M160,100 Q155,95 150,95 L145,100 Q150,105 155,105 Q160,105 160,100"
        opacity="0.5"
      />
      <circle cx="165" cy="100" r="3" opacity="0.5" />

      {/* Heart in Center */}
      <path
        d="M100,80 
           C100,75 95,70 90,70 
           C85,70 80,75 80,80 
           C80,85 85,90 100,105 
           C115,90 120,85 120,80 
           C120,75 115,70 110,70 
           C105,70 100,75 100,80 Z"
        opacity="0.8"
      />

      {/* Initials - S & G */}
      <text
        x="82"
        y="130"
        fontSize="32"
        fontFamily="serif"
        fontWeight="bold"
        fontStyle="italic"
      >
        S
      </text>
      <text
        x="94"
        y="130"
        fontSize="24"
        fontFamily="serif"
        opacity="0.5"
      >
        &
      </text>
      <text
        x="108"
        y="130"
        fontSize="32"
        fontFamily="serif"
        fontWeight="bold"
        fontStyle="italic"
      >
        G
      </text>

      {/* Decorative Dots around Circle */}
      <circle cx="100" cy="10" r="2" opacity="0.4" />
      <circle cx="100" cy="190" r="2" opacity="0.4" />
      <circle cx="10" cy="100" r="2" opacity="0.4" />
      <circle cx="190" cy="100" r="2" opacity="0.4" />
      
      {/* Diagonal Dots */}
      <circle cx="30" cy="30" r="2" opacity="0.3" />
      <circle cx="170" cy="30" r="2" opacity="0.3" />
      <circle cx="30" cy="170" r="2" opacity="0.3" />
      <circle cx="170" cy="170" r="2" opacity="0.3" />
    </svg>
  );
}
