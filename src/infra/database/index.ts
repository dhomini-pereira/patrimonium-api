import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { inject, injectable } from "tsyringe";
import type { env as ENV_CONFIG } from "@/configs/env.config";
import { AccountModel } from "./models/account.model";
import { CategoryModel } from "./models/category.model";
import { CreditCardModel } from "./models/credit-card.model";
import { CreditCardInvoiceModel } from "./models/credit-card-invoice.model";
import { FamilyMemberModel } from "./models/family-member.model";
import { GoalModel } from "./models/goal.model";
import { InvestmentModel } from "./models/investment.model";
import { PushTokenModel } from "./models/push-token.model";
import { RefreshTokenModel } from "./models/refresh-token.model";
import { SharedAccountModel } from "./models/shared-account.model";
import { TransactionModel } from "./models/transaction.model";
import { UserModel } from "./models/user.model";

@injectable()
export class DatabaseConnection {
  public db: NodePgDatabase<{
    user: typeof UserModel;
    refreshToken: typeof RefreshTokenModel;
    account: typeof AccountModel;
    category: typeof CategoryModel;
    transaction: typeof TransactionModel;
    investment: typeof InvestmentModel;
    goal: typeof GoalModel;
    pushToken: typeof PushTokenModel;
    creditCard: typeof CreditCardModel;
    creditCardInvoice: typeof CreditCardInvoiceModel;
    familyMember: typeof FamilyMemberModel;
    sharedAccount: typeof SharedAccountModel;
  }>;
  constructor(@inject("Env") private env: typeof ENV_CONFIG) {
    const pool = new Pool({
      connectionString: this.env.DATABASE_URL,
      ssl: this.env.DATABASE_URL.includes("sslmode=require")
        ? { rejectUnauthorized: false }
        : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    this.db = drizzle({
      client: pool,
      schema: {
        user: UserModel,
        refreshToken: RefreshTokenModel,
        account: AccountModel,
        category: CategoryModel,
        transaction: TransactionModel,
        investment: InvestmentModel,
        goal: GoalModel,
        pushToken: PushTokenModel,
        creditCard: CreditCardModel,
        creditCardInvoice: CreditCardInvoiceModel,
        familyMember: FamilyMemberModel,
        sharedAccount: SharedAccountModel,
      },
    });

    pool.on("error", (err) => {
      console.error("[DATABASE] Unexpected database pool error", err);
    });
  }
}
