import { and, asc, desc, eq, sql } from "drizzle-orm";
import { inject, injectable } from "tsyringe";
import type { DatabaseConnection } from "@/infra/database";
import { CreditCardModel } from "@/infra/database/models/credit-card.model";
import { CreditCardInvoiceModel } from "@/infra/database/models/credit-card-invoice.model";

@injectable()
export class CreditCardRepository {
  constructor(
    @inject("Database") private database: DatabaseConnection,
  ) { }

  async findAllByUser(userId: string) {
    return this
      .database.db
      .select()
      .from(CreditCardModel)
      .where(eq(CreditCardModel.userId, userId))
      .orderBy(asc(CreditCardModel.name))
  }

  async findById(id: string, userId: string) {
    const [creditCard] = await this
      .database.db
      .select()
      .from(CreditCardModel)
      .where(and(
        eq(CreditCardModel.id, id),
        eq(CreditCardModel.userId, userId)
      ));

    return creditCard ?? null;
  }

  async create(
    userId: string,
    data: {
      name: string;
      cardLimit: string;
      closingDay: number;
      dueDay: number;
      bestPurchaseDay?: number | null;
      color: string;
    }
  ) {
    return this
      .database.db
      .insert(CreditCardModel)
      .values({ ...data, userId })
      .returning();
  }

  async update(
    id: string,
    userId: string,
    data: Partial<{
      name: string;
      cardLimit: string;
      closingDay: number;
      dueDay: number;
      bestPurchaseDay: number;
      color: string;
    }>
  ) {
    const [creditCard] = await this
      .database.db
      .update(CreditCardModel)
      .set(data)
      .where(and(
        eq(CreditCardModel.id, id),
        eq(CreditCardModel.userId, userId)
      ))
      .returning();

    return creditCard ?? null;
  }

  async delete(id: string, userId: string) {
    const [creditCard] = await this
      .database.db
      .delete(CreditCardModel)
      .where(and(
        eq(CreditCardModel.id, id),
        eq(CreditCardModel.userId, userId)
      ))
      .returning();

    return creditCard ?? null;
  }

  async findInvoicesByCard({ cardId, userId }: { cardId: string, userId: string }) {
    return this
      .database.db
      .select()
      .from(CreditCardInvoiceModel)
      .where(and(
        eq(CreditCardInvoiceModel.creditCardId, cardId),
        eq(CreditCardInvoiceModel.userId, userId)
      ))
      .orderBy(desc(CreditCardInvoiceModel.referenceMonth));
  }

  async findInvoice({ cardId, referenceMonth, userId }: { cardId: string, referenceMonth: string, userId: string }) {
    const [invoice] = await this
      .database.db
      .select()
      .from(CreditCardInvoiceModel)
      .where(
        and(
          eq(CreditCardInvoiceModel.creditCardId, cardId),
          eq(CreditCardInvoiceModel.referenceMonth, referenceMonth),
          eq(CreditCardInvoiceModel.userId, userId)
        )
      );

    return invoice ?? null;
  }

  async upsertInvoice({ cardId, userId, referenceMonth, amount }: { cardId: string, userId: string, referenceMonth: string, amount: number }) {
    const [invoice] = await this
      .database.db
      .insert(CreditCardInvoiceModel)
      .values({
        referenceMonth,
        total: String(amount),
        creditCardId: cardId,
        userId,
      }).onConflictDoUpdate({
        target: [
          CreditCardInvoiceModel.creditCardId,
          CreditCardInvoiceModel.referenceMonth,
        ],
        set: {
          total: sql`${CreditCardInvoiceModel.total} + ${amount}`,
        }
      }).returning();

    return invoice;
  }

  async subtractFromInvoice(
    { amount, referenceMonth, cardId }: { cardId: string, referenceMonth: string, amount: number }
  ) {
    await this
      .database.db
      .update(CreditCardInvoiceModel)
      .set({
        total: sql`GREATEST(0, ${CreditCardInvoiceModel.total} - ${amount})`
      })
      .where(
        and(
          eq(CreditCardInvoiceModel.creditCardId, cardId),
          eq(CreditCardInvoiceModel.referenceMonth, referenceMonth)
        )
      );
  }

  async payInvoice(
    { invoiceId, userId, accountId, paidAmount }: { invoiceId: string, userId: string, accountId: string, paidAmount: number }
  ) {
    const [invoice] = await this
      .database.db
      .update(CreditCardInvoiceModel)
      .set({
        paid: true,
        paidAt: new Date(),
        paidWithAccountId: accountId,
        paidAmount: String(paidAmount),
      })
      .where(
        and(
          eq(CreditCardInvoiceModel.id, invoiceId),
          eq(CreditCardInvoiceModel.userId, userId)
        )
      ).returning();

    return invoice ?? null;
  }

  async unpayInvoice(
    { invoiceId, userId }: { invoiceId: string, userId: string }
  ) {
    const [invoice] = await this
      .database.db
      .update(CreditCardInvoiceModel)
      .set({
        paid: false,
        paidAt: null,
        paidWithAccountId: null,
        paidAmount: '0.00'
      })
      .where(
        and(
          eq(CreditCardInvoiceModel.id, invoiceId),
          eq(CreditCardInvoiceModel.userId, userId)
        )
      )
      .returning();

    return invoice ?? null;
  }

  async getUsedAmount(cardId: string) {
    const [{ used }] = await this
      .database.db
      .select({
        used: sql<number>`COALESCE(SUM(${CreditCardInvoiceModel.total}), 0)`,
      })
      .from(CreditCardInvoiceModel)
      .where(
        and(
          eq(CreditCardInvoiceModel.creditCardId, cardId),
          eq(CreditCardInvoiceModel.paid, false),
        )
      );

    return Number(used);
  }
}
