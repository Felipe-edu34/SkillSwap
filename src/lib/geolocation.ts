/**
 * Utilitários de Geolocalização e Cálculo de Proximidade via Fórmula de Haversine.
 */

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calcula a distância em quilômetros entre dois pares de coordenadas (latitude/longitude)
 * utilizando a Fórmula de Haversine.
 */
export function calculateHaversineDistanceKm(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number | null {
  if (
    lat1 === null ||
    lat1 === undefined ||
    lon1 === null ||
    lon1 === undefined ||
    lat2 === null ||
    lat2 === undefined ||
    lon2 === null ||
    lon2 === undefined
  ) {
    return null;
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Formata a distância em km para exibição amigável em fichas acadêmicas.
 */
export function formatDistanceKm(distanceKm: number | null): string | null {
  if (distanceKm === null || Number.isNaN(distanceKm)) return null;
  if (distanceKm < 1) {
    return `${Math.max(100, Math.round(distanceKm * 1000))} m`;
  }
  return `${distanceKm.toFixed(1).replace(".0", "")} km`;
}

/**
 * Retorna o bônus percentual de proximidade geográfica (0 a 12 pontos)
 * para o algoritmo de compatibilidade.
 */
export function calculateProximityBonus(distanceKm: number | null): {
  bonus: number;
  label: string | null;
} {
  if (distanceKm === null) {
    return { bonus: 0, label: null };
  }

  if (distanceKm <= 3) {
    return {
      bonus: 12,
      label: `Mesmo campus/bairro (~${formatDistanceKm(distanceKm)})`,
    };
  }

  if (distanceKm <= 15) {
    return {
      bonus: 9,
      label: `Mesma região urbana (~${formatDistanceKm(distanceKm)})`,
    };
  }

  if (distanceKm <= 50) {
    return {
      bonus: 5,
      label: `Região metropolitana (~${formatDistanceKm(distanceKm)})`,
    };
  }

  return {
    bonus: 0,
    label: `Distância estimada: ${formatDistanceKm(distanceKm)}`,
  };
}
