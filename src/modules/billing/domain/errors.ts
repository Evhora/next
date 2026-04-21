import { AppError } from "@/shared/errors";

export class SubscriptionNotFoundError extends AppError {
  constructor() {
    super("SUBSCRIPTION_NOT_FOUND", "No active subscription found.");
  }
}

export class CustomerNotFoundError extends AppError {
  constructor() {
    super("CUSTOMER_NOT_FOUND", "No billing customer found for user.");
  }
}

export class CheckoutError extends AppError {
  constructor(message: string) {
    super("CHECKOUT_ERROR", message);
  }
}

export class WebhookError extends AppError {
  constructor(message: string) {
    super("WEBHOOK_ERROR", message);
  }
}
