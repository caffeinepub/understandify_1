import { Check, Crown, Star, X, Zap } from "lucide-react";
import type React from "react";

interface SubscriptionModalProps {
  onSubscribe: () => void;
  onClose: () => void;
}

const PLANS = [
  {
    id: "weekly" as const,
    label: "Weekly",
    price: "₹100",
    period: "/week",
    tagline: "Great for trying out",
    badge: null,
    highlight: false,
    ocid: "subscription.weekly_button" as const,
  },
  {
    id: "monthly" as const,
    label: "Monthly",
    price: "₹300",
    period: "/month",
    tagline: "Save ₹100 vs weekly",
    badge: "Most Popular",
    highlight: true,
    ocid: "subscription.monthly_button" as const,
  },
  {
    id: "yearly" as const,
    label: "Yearly",
    price: "₹3600",
    period: "/year",
    tagline: "Save ₹600 vs monthly",
    badge: "Best Value",
    highlight: false,
    ocid: "subscription.yearly_button" as const,
  },
];

const FEATURES = [
  "Generate unlimited AI images",
  "Access all premium subjects",
  "Priority AI responses",
  "No ads, no interruptions",
  "Cancel anytime",
];

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  onSubscribe,
  onClose,
}) => {
  const handleSubscribe = (planId: "weekly" | "monthly" | "yearly") => {
    localStorage.setItem("understandify_subscribed", "true");
    localStorage.setItem("understandify_plan", planId);
    onSubscribe();
  };

  return (
    <div
      data-ocid="subscription.modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "oklch(0.05 0.03 265 / 0.92)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{
          background: "oklch(0.12 0.05 265)",
          border: "1px solid oklch(0.28 0.07 265)",
          boxShadow:
            "0 0 60px oklch(0.78 0.20 85 / 0.2), 0 25px 50px oklch(0.05 0.02 265 / 0.8)",
        }}
      >
        {/* Close button */}
        <button
          type="button"
          data-ocid="subscription.close_button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{
            background: "oklch(0.20 0.06 265)",
            border: "1px solid oklch(0.30 0.07 265)",
          }}
        >
          <X size={16} style={{ color: "oklch(0.65 0.05 265)" }} />
        </button>

        {/* Header */}
        <div className="pt-8 pb-4 px-6 text-center">
          {/* Crown icon with glow */}
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.82 0.22 85 / 0.25) 0%, oklch(0.78 0.20 65 / 0.1) 70%)",
                border: "2px solid oklch(0.82 0.18 85 / 0.5)",
                boxShadow: "0 0 30px oklch(0.82 0.18 85 / 0.3)",
              }}
            >
              <Crown size={28} style={{ color: "oklch(0.82 0.18 85)" }} />
            </div>
          </div>

          <h2
            className="font-fredoka text-2xl font-bold mb-2"
            style={{ color: "oklch(0.82 0.18 85)" }}
          >
            Unlock Premium Features
          </h2>
          <p
            className="font-nunito text-sm font-semibold max-w-xs mx-auto"
            style={{ color: "oklch(0.62 0.06 265)" }}
          >
            Subscribe to generate unlimited images and unlock all AI features
          </p>
        </div>

        {/* Features list */}
        <div className="px-6 pb-4">
          <div
            className="rounded-2xl p-4"
            style={{
              background: "oklch(0.78 0.20 195 / 0.06)",
              border: "1px solid oklch(0.75 0.20 195 / 0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Star size={14} style={{ color: "oklch(0.82 0.18 85)" }} />
              <span
                className="font-nunito text-xs font-black uppercase tracking-wider"
                style={{ color: "oklch(0.82 0.18 85)" }}
              >
                What you get
              </span>
            </div>
            <ul className="space-y-2">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check
                    size={13}
                    style={{ color: "oklch(0.72 0.22 145)", flexShrink: 0 }}
                  />
                  <span
                    className="font-nunito text-xs font-semibold"
                    style={{ color: "oklch(0.78 0.05 265)" }}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Plan cards */}
        <div className="px-6 pb-4 space-y-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="relative rounded-2xl p-4"
              style={{
                background: plan.highlight
                  ? "linear-gradient(135deg, oklch(0.22 0.10 75 / 0.6), oklch(0.18 0.08 85 / 0.4))"
                  : "oklch(0.16 0.05 265)",
                border: `2px solid ${plan.highlight ? "oklch(0.82 0.18 85 / 0.6)" : "oklch(0.26 0.07 265)"}`,
                boxShadow: plan.highlight
                  ? "0 0 20px oklch(0.82 0.18 85 / 0.15)"
                  : "none",
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full"
                  style={{
                    background: plan.highlight
                      ? "oklch(0.82 0.18 85)"
                      : "oklch(0.72 0.20 195)",
                    color: "oklch(0.10 0.04 265)",
                  }}
                >
                  <span className="font-nunito text-xs font-black">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1 mb-0.5">
                    <span
                      className="font-fredoka text-xl font-bold"
                      style={{
                        color: plan.highlight
                          ? "oklch(0.82 0.18 85)"
                          : "oklch(0.88 0.03 265)",
                      }}
                    >
                      {plan.price}
                    </span>
                    <span
                      className="font-nunito text-xs font-semibold"
                      style={{ color: "oklch(0.55 0.05 265)" }}
                    >
                      {plan.period}
                    </span>
                  </div>
                  <p
                    className="font-nunito text-xs font-semibold"
                    style={{ color: "oklch(0.55 0.05 265)" }}
                  >
                    {plan.tagline}
                  </p>
                </div>

                <button
                  type="button"
                  data-ocid={plan.ocid}
                  onClick={() => handleSubscribe(plan.id)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-nunito font-bold text-sm transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: plan.highlight
                      ? "oklch(0.82 0.18 85)"
                      : "oklch(0.22 0.07 265)",
                    color: plan.highlight
                      ? "oklch(0.10 0.04 265)"
                      : "oklch(0.78 0.08 265)",
                    border: plan.highlight
                      ? "none"
                      : "1px solid oklch(0.32 0.07 265)",
                    boxShadow: plan.highlight
                      ? "0 0 15px oklch(0.82 0.18 85 / 0.4)"
                      : "none",
                  }}
                >
                  <Zap size={14} />
                  Subscribe
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 text-center">
          <button
            type="button"
            onClick={onClose}
            className="font-nunito text-xs font-semibold transition-opacity hover:opacity-80"
            style={{ color: "oklch(0.45 0.05 265)" }}
          >
            Maybe Later
          </button>
          <p
            className="font-nunito text-xs mt-2"
            style={{ color: "oklch(0.35 0.05 265)" }}
          >
            Secure payment • Cancel anytime • No hidden fees
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
