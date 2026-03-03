import Map "mo:core/Map";
import Int "mo:core/Int";
import List "mo:core/List";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


actor {
  type Timestamp = Time.Time;

  type Mode = {
    #child;
    #parent;
  };

  type QuestionRecord = {
    question : Text;
    timestamp : Timestamp;
  };

  type Notification = {
    message : Text;
    timestamp : Timestamp;
    isRead : Bool;
  };

  type UserSession = {
    sessionId : Text;
    mode : Mode;
    lastActive : Timestamp;
  };

  public type PlayerStats = {
    totalKills : Nat;
    matchesPlayed : Nat;
    wins : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  // Access control state
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  let parentPin = Map.empty<Principal, Text>();
  let sessionMap = Map.empty<Principal, UserSession>();
  let questionHistory = Map.empty<Principal, List.List<QuestionRecord>>();
  let notifications = Map.empty<Principal, List.List<Notification>>();
  let playerStatsMap = Map.empty<Principal, PlayerStats>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  module Notification {
    public func compare(notification1 : Notification, notification2 : Notification) : Order.Order {
      Int.compare(notification1.timestamp, notification2.timestamp);
    };
  };

  // ── User profile functions (required by instructions) ──────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Parent-pin / session functions ─────────────────────────────────────────

  public query ({ caller }) func isParentPinSet() : async Bool {
    parentPin.containsKey(caller);
  };

  public shared ({ caller }) func setParentPin(pin : Text) : async Bool {
    if (parentPin.containsKey(caller)) { Runtime.trap("PIN already set for this user") };
    parentPin.add(caller, pin);
    true;
  };

  public shared ({ caller }) func authenticateParentMode(pin : Text) : async Bool {
    let storedPin = parentPin.get(caller);
    switch (storedPin) {
      case (null) { false };
      case (?actualPin) { actualPin == pin };
    };
  };

  public shared ({ caller }) func switchMode() : async Mode {
    let currentSession = sessionMap.get(caller);
    switch (currentSession) {
      case (null) {
        let newSession : UserSession = {
          sessionId = caller.toText();
          mode = #child;
          lastActive = Time.now();
        };
        sessionMap.add(caller, newSession);
        #child;
      };
      case (?session) {
        let newMode = switch (session.mode) {
          case (#child) { #parent };
          case (#parent) { #child };
        };
        let updatedSession : UserSession = {
          sessionId = session.sessionId;
          mode = newMode;
          lastActive = Time.now();
        };
        sessionMap.add(caller, updatedSession);
        newMode;
      };
    };
  };

  public shared ({ caller }) func recordQuestion(question : Text) : async () {
    let newRecord : QuestionRecord = {
      question;
      timestamp = Time.now();
    };

    let existingHistory = switch (questionHistory.get(caller)) {
      case (null) {
        let list = List.empty<QuestionRecord>();
        list.add(newRecord);
        list;
      };
      case (?history) {
        history.add(newRecord);
        history;
      };
    };

    questionHistory.add(caller, existingHistory);

    let newNotification : Notification = {
      message = "Child asked: " # question;
      timestamp = Time.now();
      isRead = false;
    };

    let existingNotifications = switch (notifications.get(caller)) {
      case (null) {
        let list = List.empty<Notification>();
        list.add(newNotification);
        list;
      };
      case (?notifs) {
        notifs.add(newNotification);
        notifs;
      };
    };

    notifications.add(caller, existingNotifications);
  };

  public query ({ caller }) func getQuestionHistory() : async [QuestionRecord] {
    switch (questionHistory.get(caller)) {
      case (null) { [] };
      case (?history) { history.toArray() };
    };
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    let notificationArray = switch (notifications.get(caller)) {
      case (null) { [] };
      case (?notifs) { notifs.toArray() };
    };

    notificationArray.sort();
  };

  public query ({ caller }) func getUnreadNotificationCount() : async Nat {
    switch (notifications.get(caller)) {
      case (null) { 0 };
      case (?notifs) {
        var count = 0;
        notifs.values().forEach(
          func(notif) {
            if (not notif.isRead) { count += 1 };
          }
        );
        count;
      };
    };
  };

  public shared ({ caller }) func markAllNotificationsRead() : async () {
    switch (notifications.get(caller)) {
      case (null) {};
      case (?notifs) {
        let updatedNotifs = notifs.map<Notification, Notification>(
          func(notif) {
            {
              message = notif.message;
              timestamp = notif.timestamp;
              isRead = true;
            };
          }
        );
        notifications.add(caller, updatedNotifs);
      };
    };
  };

  // ── Player stats functions ─────────────────────────────────────────────────

  public shared ({ caller }) func updatePlayerStats(stats : PlayerStats) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update player stats");
    };
    playerStatsMap.add(caller, stats);
  };

  public shared ({ caller }) func adminUpdatePlayerStats(principal : Principal, stats : PlayerStats) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update stats for other players");
    };
    playerStatsMap.add(principal, stats);
  };

  public query func getPlayerStats(principal : Principal) : async ?PlayerStats {
    playerStatsMap.get(principal);
  };

  public query ({ caller }) func getMyPlayerStats() : async ?PlayerStats {
    playerStatsMap.get(caller);
  };
};
