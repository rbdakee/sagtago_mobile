/* SaqtaGo — Tweaks panel (управляет токенами на :root) */
const TWEAK_DEFAULTS = {
  theme: 'graphite',
  glassBlur: 22,
  glassAlpha: 0.66,
  displayFont: 'unbounded',
};

function applyTheme(t) { document.documentElement.setAttribute('data-theme', t); }
function applyGlass(blur, alpha) {
  const root = document.documentElement;
  const rgb = (getComputedStyle(root).getPropertyValue('--glass-rgb').trim() || '255, 255, 255');
  root.style.setProperty('--glass-blur', blur + 'px');
  root.style.setProperty('--glass-tint', 'rgba(' + rgb + ', ' + alpha + ')');
  root.style.setProperty('--glass-tint-strong', 'rgba(' + rgb + ', ' + Math.min(1, alpha + 0.12) + ')');
}
function applyFont(f) {
  document.documentElement.style.setProperty('--font-display',
    f === 'manrope' ? "'Manrope', system-ui, sans-serif" : "'Unbounded', system-ui, sans-serif");
}

function TweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => { applyTheme(t.theme); applyGlass(t.glassBlur, t.glassAlpha); }, [t.theme]);
  React.useEffect(() => { applyGlass(t.glassBlur, t.glassAlpha); }, [t.glassBlur, t.glassAlpha]);
  React.useEffect(() => { applyFont(t.displayFont); }, [t.displayFont]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Тема" />
      <TweakSelect label="Палитра" value={t.theme}
        options={[
          { value: 'graphite', label: 'Graphite' },
          { value: 'graphite-dark', label: 'Graphite Dark' },
          { value: 'pine', label: 'Deep Pine' },
          { value: 'fresh', label: 'Fresh Market' },
          { value: 'apple', label: 'Apple Green' },
          { value: 'forest', label: 'Forest Premium' },
          { value: 'berry', label: 'Berry Harvest' },
          { value: 'midnight', label: 'Midnight Saver' },
        ]}
        onChange={v => setTweak('theme', v)} />

      <TweakSection label="Liquid Glass" />
      <TweakSlider label="Размытие" value={t.glassBlur} min={0} max={40} unit="px"
        onChange={v => setTweak('glassBlur', v)} />
      <TweakSlider label="Прозрачность" value={Math.round(t.glassAlpha * 100)} min={30} max={95} unit="%"
        onChange={v => setTweak('glassAlpha', v / 100)} />

      <TweakSection label="Типографика" />
      <TweakRadio label="Дисплей-шрифт" value={t.displayFont}
        options={['unbounded', 'manrope']}
        onChange={v => setTweak('displayFont', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<TweaksApp />);
