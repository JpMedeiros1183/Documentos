export default function WaveBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated gradient background */}
      <div className="absolute inset-0 ocean-gradient" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,240,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating orbs */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #00d4aa 0%, transparent 70%)',
          top: '10%',
          right: '-10%',
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-72 h-72 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #0080e6 0%, transparent 70%)',
          bottom: '20%',
          left: '-5%',
          animation: 'float 6s ease-in-out infinite 1s',
        }}
      />
      <div
        className="absolute w-48 h-48 rounded-full opacity-5"
        style={{
          background: 'radial-gradient(circle, #00f0ff 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          animation: 'float 10s ease-in-out infinite 2s',
        }}
      />

      {/* Wave SVGs at bottom */}
      <svg
        className="absolute bottom-0 w-full h-40 opacity-10"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#00d4aa"
          d="M0,192L48,208C96,224,192,256,288,250.7C384,245,480,203,576,181.3C672,160,768,160,864,181.3C960,203,1056,245,1152,245.3C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0;30,5;0,0"
            dur="8s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
      <svg
        className="absolute bottom-0 w-full h-32 opacity-5"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#0080e6"
          d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,213.3C960,192,1056,160,1152,165.3C1248,171,1344,213,1392,234.7L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0;-20,8;0,0"
            dur="6s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
}
