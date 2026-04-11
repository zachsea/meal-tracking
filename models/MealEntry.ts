import mongoose, { Schema, Document, Types } from "mongoose";

// snapshot of a single ingredient at log time, with optional per-log override
export interface ILoggedIngredient {
  _id: Types.ObjectId;
  recipeIngredientId?: Types.ObjectId; // ref back to IIngredient._id
  name: string;
  amount: string;
  kcal: number;
  protein: number;
  fiber: number;
  carbs: number;
  sugar: number;
  sodium: number;
  overridden: boolean; // true if user adjusted this ingredient specifically for this log
}

export interface IMealEntry extends Document {
  userId: string;

  // recipe linkage if applicable
  recipeId?: Types.ObjectId;
  recipeVersionId?: Types.ObjectId;
  versionNumber?: number;
  recipeName: string;

  servingsEaten: number;

  // top-level macros
  kcal: number;
  protein: number;
  fiber: number;
  carbs: number;
  sugar: number;
  sodium: number;

  // how macros ended up
  macrosOverridden: boolean; // top-level numbers differ from recipe snapshot
  ingredientsOverridden: boolean; // one or more per-ingredient values were adjusted

  // optional ingredient-level snapshot for this log
  loggedIngredients: ILoggedIngredient[];

  notes?: string;
  loggedAt: Date;
}

const LoggedIngredientSchema = new Schema<ILoggedIngredient>(
  {
    recipeIngredientId: { type: Schema.Types.ObjectId },
    name: { type: String, required: true },
    amount: { type: String, required: true },
    kcal: { type: Number, required: true, default: 0 },
    protein: { type: Number, required: true, default: 0 },
    fiber: { type: Number, required: true, default: 0 },
    carbs: { type: Number, required: true, default: 0 },
    sugar: { type: Number, required: true, default: 0 },
    sodium: { type: Number, required: true, default: 0 },
    overridden: { type: Boolean, default: false },
  },
  { _id: true },
);

const MealEntrySchema = new Schema<IMealEntry>(
  {
    userId: { type: String, required: true, index: true },

    recipeId: { type: Schema.Types.ObjectId, ref: "Recipe" },
    recipeVersionId: { type: Schema.Types.ObjectId },
    versionNumber: { type: Number },
    recipeName: { type: String, required: true },

    servingsEaten: { type: Number, required: true },

    kcal: { type: Number, required: true },
    protein: { type: Number, required: true },
    fiber: { type: Number, required: true },
    carbs: { type: Number, required: true },
    sugar: { type: Number, required: true },
    sodium: { type: Number, required: true },

    macrosOverridden: { type: Boolean, default: false },
    ingredientsOverridden: { type: Boolean, default: false },

    loggedIngredients: { type: [LoggedIngredientSchema], default: [] },

    notes: { type: String },
    loggedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

MealEntrySchema.index({ userId: 1, loggedAt: -1 });

export const MealEntry =
  mongoose.models.MealEntry ||
  mongoose.model<IMealEntry>("MealEntry", MealEntrySchema);
