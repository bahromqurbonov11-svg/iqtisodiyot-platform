interface TabsProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  items: { value: T; label: string; count?: number }[];
  ariaLabel: string;
}

export function Tabs<T extends string>({ value, onChange, items, ariaLabel }: TabsProps<T>) {
  return (
    <div className="tabs" role="tablist" aria-label={ariaLabel}>
      {items.map((it) => (
        <button
          key={it.value}
          role="tab"
          aria-selected={value === it.value}
          className={`tabs__tab${value === it.value ? ' is-active' : ''}`}
          onClick={() => onChange(it.value)}
        >
          {it.label}
          {it.count !== undefined && <span className="tabs__count">{it.count}</span>}
        </button>
      ))}
    </div>
  );
}
