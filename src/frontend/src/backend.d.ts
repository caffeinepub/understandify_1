import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface QuestionRecord {
    question: string;
    timestamp: Timestamp;
}
export interface Notification {
    isRead: boolean;
    message: string;
    timestamp: Timestamp;
}
export interface UserProfile {
    name: string;
}
export interface PlayerStats {
    wins: bigint;
    matchesPlayed: bigint;
    totalKills: bigint;
}
export enum Mode {
    child = "child",
    parent = "parent"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminUpdatePlayerStats(principal: Principal, stats: PlayerStats): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    authenticateParentMode(pin: string): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyPlayerStats(): Promise<PlayerStats | null>;
    getNotifications(): Promise<Array<Notification>>;
    getPlayerStats(principal: Principal): Promise<PlayerStats | null>;
    getQuestionHistory(): Promise<Array<QuestionRecord>>;
    getUnreadNotificationCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isParentPinSet(): Promise<boolean>;
    markAllNotificationsRead(): Promise<void>;
    recordQuestion(question: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setParentPin(pin: string): Promise<boolean>;
    switchMode(): Promise<Mode>;
    updatePlayerStats(stats: PlayerStats): Promise<void>;
}
