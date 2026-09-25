import { api } from "./api";

export interface ValidateCouponResponse {
  isValid: boolean;
  coupon: {
    id: string;
    code: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
  };
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
}

export const couponService = {
  validateCoupon: async (
    code: string,
    planId: string,
    billingMonths: number = 1,
  ) => {
    return api.post<ValidateCouponResponse>("/coupons/validate", {
      code: code.trim().toUpperCase(),
      planId,
      billingMonths,
    });
  },
};
