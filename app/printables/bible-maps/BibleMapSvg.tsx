/**
 * Server-rendered SVG Bible map. Inline SVG on purpose: every place name and
 * region label is real text in the HTML — crawlable and screen-readable —
 * where every competitor on these SERPs serves a flat image.
 *
 * Label text uses paint-order stroke (white halo) so names stay readable over
 * coastlines; that is set in maps.css (.bm-svg text). Traditional sites get an
 * asterisk — the legend and the page copy explain it. Do not remove them.
 */
import {
  BibleMap, MapRegion, MapPlace, project,
} from '@/lib/bible-maps'

const SEA = '#cfe3f2'
const LAND = '#f6eed9'
const LAND_EDGE = '#c9b98a'
const LAKE_EDGE = '#8fb3d1'
const RIVER = '#7fa8c9'

const ROUTE_STYLE: Record<string, { stroke: string; dash?: string; width: number }> = {
  exodus: { stroke: '#dc2626', width: 3.5 },
  avoided: { stroke: '#9ca3af', dash: '7 6', width: 2.5 },
  j1: { stroke: '#dc2626', width: 2.8 },
  j2: { stroke: '#2563eb', width: 2.8 },
  j3: { stroke: '#9333ea', width: 2.8 },
  rome: { stroke: '#374151', dash: '8 5', width: 2.8 },
}

function PlaceMark({ p, x, y }: { p: MapPlace; x: number; y: number }) {
  if (p.kind === 'mountain') {
    return <path d={`M${x} ${y - 6}L${x + 6} ${y + 4}L${x - 6} ${y + 4}Z`} fill="#92400e" stroke="#fff" strokeWidth="1" />
  }
  if (p.kind === 'site') {
    return (
      <g stroke="#b91c1c" strokeWidth="2.4" strokeLinecap="round">
        <line x1={x - 4.5} y1={y - 4.5} x2={x + 4.5} y2={y + 4.5} />
        <line x1={x - 4.5} y1={y + 4.5} x2={x + 4.5} y2={y - 4.5} />
      </g>
    )
  }
  if (p.kind === 'capital') {
    return (
      <g>
        <circle cx={x} cy={y} r={5.5} fill="#166534" stroke="#fff" strokeWidth="1.6" />
        <circle cx={x} cy={y} r={1.8} fill="#fff" />
      </g>
    )
  }
  return <circle cx={x} cy={y} r={p.small ? 3 : 4} fill="#7f1d1d" stroke="#fff" strokeWidth="1.2" />
}

function m2height(map: BibleMap, region: MapRegion): number {
  if (map.cropLatMin == null) return region.height
  return (region.proj.latMax - map.cropLatMin) * region.proj.scale
}

export function BibleMapSvg({
  map, region, preview = false, idPrefix = '',
}: {
  map: BibleMap
  region: MapRegion
  preview?: boolean
  idPrefix?: string
}) {
  const { width } = region
  // Optional bottom crop: the Levant bbox runs to the Gulf of Aqaba, which is
  // empty desert on four of the maps — cropping it keeps the printed sheet
  // full of map instead of 40% Negev.
  const height = m2height(map, region)
  const pr = (lat: number, lon: number) => project(region, lat, lon)

  return (
    <svg
      className="bm-svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${map.title} — printable Bible map`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={width} height={height} fill={SEA} />
      {region.land.map((d, i) => (
        <path key={`l${i}`} d={d} fill={LAND} stroke={LAND_EDGE} strokeWidth="1.4" strokeLinejoin="round" />
      ))}

      {/* Tribal areas sit on the land, under water + labels. Soft tints, not
          borders: Joshua 13-19 lists boundary towns nobody can fully locate,
          so hard lines would claim a precision the text does not give. */}
      {map.tribes?.map(t => {
        const [x, y] = pr(t.lat, t.lon)
        return (
          <g key={t.name}>
            <ellipse cx={x} cy={y} rx={t.rx} ry={t.ry} fill={t.color} opacity="0.6" />
            {!preview && (
              <text x={x} y={y + 4} textAnchor="middle" className="bm-tribe" fontSize={t.name.length > 10 ? 12 : 14}>
                {t.name}
              </text>
            )}
          </g>
        )
      })}

      {region.lakes.map((d, i) => (
        <path key={`k${i}`} d={d} fill={SEA} stroke={LAKE_EDGE} strokeWidth="1.2" />
      ))}
      {map.rivers.map((riv, i) => (
        <polyline
          key={`r${i}`}
          points={riv.map(([lat, lon]) => pr(lat, lon).map(v => v.toFixed(1)).join(',')).join(' ')}
          fill="none" stroke={RIVER} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
        />
      ))}

      {map.routes.map(r => {
        const s = ROUTE_STYLE[r.style]
        return (
          <polyline
            key={r.name}
            points={r.points.map(([lat, lon]) => pr(lat, lon).map(v => v.toFixed(1)).join(',')).join(' ')}
            fill="none" stroke={s.stroke} strokeWidth={s.width}
            strokeDasharray={s.dash} strokeLinecap="round" strokeLinejoin="round"
            opacity="0.85"
          />
        )
      })}

      {!preview && map.labels.map(l => {
        const [x, y] = pr(l.lat, l.lon)
        const cls = l.color === 'water' ? 'bm-water' : 'bm-region'
        return (
          <text
            key={l.name}
            x={x} y={y}
            textAnchor="middle"
            className={cls}
            fontSize={l.size}
            transform={l.angle ? `rotate(${l.angle} ${x} ${y})` : undefined}
          >
            {l.name}
          </text>
        )
      })}

      {map.places.map(p => {
        const [x, y] = pr(p.lat, p.lon)
        return (
          <g key={p.name}>
            <PlaceMark p={p} x={x} y={y} />
            {!preview && (
              <text
                x={x + p.dx} y={y + p.dy}
                textAnchor={p.anchor ?? 'start'}
                className={p.kind === 'capital' ? 'bm-place bm-cap' : 'bm-place'}
                fontSize={p.small ? 11 : 13}
              >
                {p.name}{p.traditional ? '*' : ''}
              </text>
            )}
          </g>
        )
      })}

      {/* printed-sheet credit, baked into the artifact like the coloring pages */}
      {!preview && (
        <text x={width - 8} y={height - 8} textAnchor="end" className="bm-credit-svg" fontSize="11">
          FaithfulKids.app
        </text>
      )}
    </svg>
  )
}

export function MapLegend({ map }: { map: BibleMap }) {
  const hasTraditional = map.places.some(p => p.traditional)
  return (
    <div className="bm-legend">
      <span><i className="bm-dot bm-dot-cap" /> major city</span>
      <span><i className="bm-dot bm-dot-city" /> city or town</span>
      {map.places.some(p => p.kind === 'mountain') && <span><i className="bm-dot bm-dot-mtn" /> mountain</span>}
      {map.routes.map(r => {
        const s = ROUTE_STYLE[r.style]
        return (
          <span key={r.name}>
            <i className="bm-line" style={{ background: s.dash ? 'transparent' : s.stroke, borderTop: s.dash ? `2.5px dashed ${s.stroke}` : undefined }} />{' '}
            {r.name}
          </span>
        )
      })}
      {hasTraditional && <span className="bm-trad-note">* traditional site — see note below</span>}
    </div>
  )
}
