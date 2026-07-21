import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

export interface CanvasCaptchaRef {
  refresh: () => void;
  validate: (input: string) => boolean;
}

interface CanvasCaptchaProps {
  onValidate?: (isValid: boolean) => void;
}

const CanvasCaptcha = forwardRef<CanvasCaptchaRef, CanvasCaptchaProps>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captchaText, setCaptchaText] = useState('');

  const generateRandomChar = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid O,0,1,I
    return chars.charAt(Math.floor(Math.random() * chars.length));
  };

  const drawCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background color
    ctx.fillStyle = '#f3f4f6'; // bg-gray-100
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let newCaptcha = '';

    // Draw characters
    const charCount = 5;
    for (let i = 0; i < charCount; i++) {
      const char = generateRandomChar();
      newCaptcha += char;

      const x = 20 + i * 25;
      const y = 30 + Math.random() * 10;
      const angle = (Math.random() - 0.5) * 0.5;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      
      // Random color for each character
      ctx.fillStyle = `rgb(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100})`;
      ctx.font = `bold ${24 + Math.random() * 8}px Inter, sans-serif`;
      ctx.fillText(char, 0, 0);
      
      ctx.restore();
    }

    // Add noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Add noise dots
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
      ctx.fill();
    }

    setCaptchaText(newCaptcha);
  };

  useEffect(() => {
    drawCaptcha();
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      drawCaptcha();
    },
    validate: (input: string) => {
      const isValid = input.toUpperCase() === captchaText;
      if (props.onValidate) props.onValidate(isValid);
      return isValid;
    }
  }));

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm cursor-pointer" onClick={drawCaptcha} title="Klik untuk mengganti Captcha">
        <canvas ref={canvasRef} width={160} height={50} className="w-full h-[50px] object-cover" />
      </div>
      <button type="button" onClick={drawCaptcha} className="text-xs text-blue-600 hover:underline">
        Coba captcha yang lain.
      </button>
    </div>
  );
});

export default CanvasCaptcha;
