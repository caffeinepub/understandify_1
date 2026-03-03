export type WeaponType = "pistol" | "assault_rifle" | "sniper";

export interface Weapon {
  type: WeaponType;
  name: string;
  damage: number;
  fireRate: number; // shots per second
  reloadTime: number; // seconds
  maxAmmo: number;
  currentAmmo: number;
  bulletSpeed: number;
  bulletColor: string;
  spread: number; // radians
}

export const WEAPON_DEFINITIONS: Record<
  WeaponType,
  Omit<Weapon, "currentAmmo">
> = {
  pistol: {
    type: "pistol",
    name: "Pistol",
    damage: 25,
    fireRate: 3,
    reloadTime: 1.2,
    maxAmmo: 12,
    bulletSpeed: 18,
    bulletColor: "#ffcc00",
    spread: 0.05,
  },
  assault_rifle: {
    type: "assault_rifle",
    name: "Assault Rifle",
    damage: 18,
    fireRate: 8,
    reloadTime: 2.0,
    maxAmmo: 30,
    bulletSpeed: 22,
    bulletColor: "#ff6600",
    spread: 0.08,
  },
  sniper: {
    type: "sniper",
    name: "Sniper Rifle",
    damage: 80,
    fireRate: 0.8,
    reloadTime: 3.0,
    maxAmmo: 5,
    bulletSpeed: 35,
    bulletColor: "#00ffff",
    spread: 0.01,
  },
};

export function createWeapon(type: WeaponType): Weapon {
  const def = WEAPON_DEFINITIONS[type];
  return { ...def, currentAmmo: def.maxAmmo };
}

export function canFire(
  weapon: Weapon,
  lastFireTime: number,
  now: number,
): boolean {
  const cooldown = 1000 / weapon.fireRate;
  return weapon.currentAmmo > 0 && now - lastFireTime >= cooldown;
}

export function fireWeapon(weapon: Weapon): Weapon {
  return { ...weapon, currentAmmo: Math.max(0, weapon.currentAmmo - 1) };
}

export function reloadWeapon(weapon: Weapon): Weapon {
  return { ...weapon, currentAmmo: weapon.maxAmmo };
}
