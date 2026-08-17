export function playChime(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === '2hour') {
      // Three ascending tones (C5, E5, G5) each 200ms
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const startTime = ctx.currentTime + i * 0.2;
        const endTime = startTime + 0.15;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, endTime);
        
        osc.start(startTime);
        osc.stop(endTime);
      });
    } else if (type === '15min') {
      // Two quick beeps (A5) each 150ms
      const freqs = [880, 880];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const startTime = ctx.currentTime + i * 0.2;
        const endTime = startTime + 0.1;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gain.gain.linearRampToValueAtTime(0, endTime);
        
        osc.start(startTime);
        osc.stop(endTime);
      });
    }
  } catch (e) {
    console.error('AudioContext error', e);
  }
}

export function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission();
  }
}

export function showNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}
