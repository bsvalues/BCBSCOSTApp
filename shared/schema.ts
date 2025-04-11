import { pgTable, text, serial, integer, boolean, timestamp, json, decimal, jsonb, uniqueIndex, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  name: text("name"),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  isActive: true,
});

// Environment
export const environments = pgTable("environments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertEnvironmentSchema = createInsertSchema(environments);

// API Endpoints
export const apiEndpoints = pgTable("api_endpoints", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  method: text("method").notNull(),
  status: text("status").notNull().default("online"),
  requiresAuth: boolean("requires_auth").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertApiEndpointSchema = createInsertSchema(apiEndpoints).pick({
  path: true,
  method: true,
  status: true,
  requiresAuth: true,
});

// Settings
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  type: text("type").notNull().default("string"),
});

export const insertSettingSchema = createInsertSchema(settings);

// Activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  icon: text("icon").notNull(),
  iconColor: text("icon_color").notNull().default("primary"),
  details: json("details").$type<any>(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  action: true,
  icon: true,
  iconColor: true,
  details: true,
});

// Repository status
export const repositoryStatus = pgTable("repository_status", {
  id: serial("id").primaryKey(),
  sourceRepo: text("source_repo").notNull(),
  targetRepo: text("target_repo").notNull(),
  status: text("status").notNull().default("pending"),
  steps: json("steps").notNull().default([]),
  clonedAt: timestamp("cloned_at"),
});

export const insertRepositoryStatusSchema = createInsertSchema(repositoryStatus).pick({
  sourceRepo: true,
  targetRepo: true,
  status: true,
  steps: true,
});

// Building Costs
export const buildingCosts = pgTable("building_costs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  buildingType: text("building_type").notNull(),
  squareFootage: integer("square_footage").notNull(),
  costPerSqft: decimal("cost_per_sqft", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 14, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBuildingCostSchema = createInsertSchema(buildingCosts).pick({
  name: true,
  region: true,
  buildingType: true,
  squareFootage: true,
  costPerSqft: true,
  totalCost: true,
});

// Cost Factors
export const costFactors = pgTable("cost_factors", {
  id: serial("id").primaryKey(),
  region: text("region").notNull(),
  buildingType: text("building_type").notNull(),
  baseCost: decimal("base_cost", { precision: 10, scale: 2 }).notNull(),
  complexityFactor: decimal("complexity_factor", { precision: 5, scale: 2 }).notNull().default("1.0"),
  regionFactor: decimal("region_factor", { precision: 5, scale: 2 }).notNull().default("1.0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCostFactorSchema = createInsertSchema(costFactors).pick({
  region: true,
  buildingType: true,
  baseCost: true,
  complexityFactor: true,
  regionFactor: true,
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Environment = typeof environments.$inferSelect;
export type InsertEnvironment = z.infer<typeof insertEnvironmentSchema>;

export type ApiEndpoint = typeof apiEndpoints.$inferSelect;
export type InsertApiEndpoint = z.infer<typeof insertApiEndpointSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type RepositoryStatus = typeof repositoryStatus.$inferSelect;
export type InsertRepositoryStatus = z.infer<typeof insertRepositoryStatusSchema>;

export type BuildingCost = typeof buildingCosts.$inferSelect;
export type InsertBuildingCost = z.infer<typeof insertBuildingCostSchema>;

// Material Types
export const materialTypes = pgTable("material_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  unit: text("unit").notNull().default("sqft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMaterialTypeSchema = createInsertSchema(materialTypes).pick({
  name: true,
  code: true,
  description: true,
  unit: true,
});

// Material Costs by Building Type
export const materialCosts = pgTable("material_costs", {
  id: serial("id").primaryKey(),
  materialTypeId: integer("material_type_id").notNull(),
  buildingType: text("building_type").notNull(),
  region: text("region").notNull(),
  costPerUnit: decimal("cost_per_unit", { precision: 10, scale: 2 }).notNull(),
  defaultPercentage: decimal("default_percentage", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
  return {
    uniqueMaterialBuilding: uniqueIndex("material_building_region_idx").on(
      table.materialTypeId, 
      table.buildingType,
      table.region
    ),
  };
});

export const insertMaterialCostSchema = createInsertSchema(materialCosts).pick({
  materialTypeId: true,
  buildingType: true,
  region: true,
  costPerUnit: true,
  defaultPercentage: true,
});

// Building Cost Materials (for saved estimates)
export const buildingCostMaterials = pgTable("building_cost_materials", {
  id: serial("id").primaryKey(),
  buildingCostId: integer("building_cost_id").notNull(),
  materialTypeId: integer("material_type_id").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  costPerUnit: decimal("cost_per_unit", { precision: 10, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 14, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBuildingCostMaterialSchema = createInsertSchema(buildingCostMaterials).pick({
  buildingCostId: true,
  materialTypeId: true,
  quantity: true,
  costPerUnit: true,
  percentage: true,
  totalCost: true,
});

export type CostFactor = typeof costFactors.$inferSelect;
export type InsertCostFactor = z.infer<typeof insertCostFactorSchema>;

export type MaterialType = typeof materialTypes.$inferSelect;
export type InsertMaterialType = z.infer<typeof insertMaterialTypeSchema>;

export type MaterialCost = typeof materialCosts.$inferSelect;
export type InsertMaterialCost = z.infer<typeof insertMaterialCostSchema>;

export type BuildingCostMaterial = typeof buildingCostMaterials.$inferSelect;
export type InsertBuildingCostMaterial = z.infer<typeof insertBuildingCostMaterialSchema>;

// Calculation History
export const calculationHistory = pgTable("calculation_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name"),
  region: text("region").notNull(),
  buildingType: text("building_type").notNull(),
  squareFootage: integer("square_footage").notNull(),
  baseCost: text("base_cost").notNull(),
  regionFactor: text("region_factor").notNull(),
  complexity: text("complexity").notNull(),
  complexityFactor: text("complexity_factor").notNull(),
  quality: text("quality"),
  qualityFactor: text("quality_factor"),
  condition: text("condition"),
  conditionFactor: text("condition_factor"),
  costPerSqft: text("cost_per_sqft").notNull(),
  totalCost: text("total_cost").notNull(),
  adjustedCost: text("adjusted_cost").notNull(),
  assessedValue: text("assessed_value"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCalculationHistorySchema = createInsertSchema(calculationHistory).pick({
  userId: true,
  name: true,
  region: true,
  buildingType: true,
  squareFootage: true,
  baseCost: true,
  regionFactor: true,
  complexity: true,
  complexityFactor: true,
  quality: true,
  qualityFactor: true,
  condition: true,
  conditionFactor: true,
  costPerSqft: true,
  totalCost: true,
  adjustedCost: true,
  assessedValue: true,
});

export type CalculationHistory = typeof calculationHistory.$inferSelect;
export type InsertCalculationHistory = z.infer<typeof insertCalculationHistorySchema>;

// Benton County Assessment Matrix Tables
export const bentonMatrixAxis = pgTable("benton_matrix_axis", {
  id: serial("id").primaryKey(),
  matrixYear: integer("matrix_year").notNull(),
  axisCd: text("axis_cd").notNull(),
  dataType: text("data_type").notNull(),
  lookupQuery: text("lookup_query"),
  matrixType: text("matrix_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBentonMatrixAxisSchema = createInsertSchema(bentonMatrixAxis).pick({
  matrixYear: true,
  axisCd: true,
  dataType: true,
  lookupQuery: true,
  matrixType: true,
});

export const bentonMatrix = pgTable("benton_matrix", {
  id: serial("id").primaryKey(),
  matrixId: integer("matrix_id").notNull(),
  matrixYear: integer("matrix_year").notNull(),
  label: text("label").notNull(),
  axis1: text("axis_1").notNull(),
  axis2: text("axis_2").notNull(),
  matrixDescription: text("matrix_description").notNull(),
  operator: text("operator").notNull(),
  defaultCellValue: decimal("default_cell_value", { precision: 10, scale: 2 }).notNull(),
  bInterpolate: boolean("b_interpolate").notNull().default(false),
  matrixType: text("matrix_type").notNull(),
  matrixSubTypeCd: text("matrix_sub_type_cd"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBentonMatrixSchema = createInsertSchema(bentonMatrix).pick({
  matrixId: true,
  matrixYear: true,
  label: true,
  axis1: true,
  axis2: true,
  matrixDescription: true,
  operator: true,
  defaultCellValue: true,
  bInterpolate: true,
  matrixType: true,
  matrixSubTypeCd: true,
});

export const bentonMatrixDetail = pgTable("benton_matrix_detail", {
  id: serial("id").primaryKey(),
  matrixId: integer("matrix_id").notNull(),
  matrixYear: integer("matrix_year").notNull(),
  axis1Value: text("axis_1_value").notNull(),
  axis2Value: text("axis_2_value").notNull(),
  cellValue: decimal("cell_value", { precision: 14, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBentonMatrixDetailSchema = createInsertSchema(bentonMatrixDetail).pick({
  matrixId: true,
  matrixYear: true,
  axis1Value: true,
  axis2Value: true,
  cellValue: true,
});

export const bentonImprvSchedMatrixAssoc = pgTable("benton_imprv_sched_matrix_assoc", {
  id: serial("id").primaryKey(),
  imprvDetMethCd: text("imprv_det_meth_cd").notNull(),
  imprvDetTypeCd: text("imprv_det_type_cd").notNull(),
  imprvDetClassCd: text("imprv_det_class_cd").notNull(),
  imprvYr: integer("imprv_yr").notNull(),
  matrixId: integer("matrix_id").notNull(),
  matrixOrder: integer("matrix_order").notNull(),
  adjFactor: integer("adj_factor").notNull(),
  imprvDetSubClassCd: text("imprv_det_sub_class_cd").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBentonImprvSchedMatrixAssocSchema = createInsertSchema(bentonImprvSchedMatrixAssoc).pick({
  imprvDetMethCd: true,
  imprvDetTypeCd: true,
  imprvDetClassCd: true,
  imprvYr: true,
  matrixId: true,
  matrixOrder: true,
  adjFactor: true,
  imprvDetSubClassCd: true,
});

export const bentonDepreciationMatrix = pgTable("benton_depreciation_matrix", {
  id: serial("id").primaryKey(),
  valSubElement: text("val_sub_element").notNull(),
  matrixId: integer("matrix_id").notNull(),
  age: integer("age").notNull(),
  factor: integer("factor").notNull(),
  conditionMapped: text("condition_mapped").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBentonDepreciationMatrixSchema = createInsertSchema(bentonDepreciationMatrix).pick({
  valSubElement: true,
  matrixId: true,
  age: true,
  factor: true,
  conditionMapped: true,
});

export type BentonMatrixAxis = typeof bentonMatrixAxis.$inferSelect;
export type InsertBentonMatrixAxis = z.infer<typeof insertBentonMatrixAxisSchema>;

export type BentonMatrix = typeof bentonMatrix.$inferSelect;
export type InsertBentonMatrix = z.infer<typeof insertBentonMatrixSchema>;

export type BentonMatrixDetail = typeof bentonMatrixDetail.$inferSelect;
export type InsertBentonMatrixDetail = z.infer<typeof insertBentonMatrixDetailSchema>;

export type BentonImprvSchedMatrixAssoc = typeof bentonImprvSchedMatrixAssoc.$inferSelect;
export type InsertBentonImprvSchedMatrixAssoc = z.infer<typeof insertBentonImprvSchedMatrixAssocSchema>;

export type BentonDepreciationMatrix = typeof bentonDepreciationMatrix.$inferSelect;
export type InsertBentonDepreciationMatrix = z.infer<typeof insertBentonDepreciationMatrixSchema>;

// Connection History
export const connectionHistory = pgTable("connection_history", {
  id: serial("id").primaryKey(),
  connectionType: text("connection_type").notNull(), // ftp, arcgis, sqlserver, etc.
  status: text("status").notNull(), // success, failed
  message: text("message").notNull(),
  details: json("details").notNull().default({}), // Store any additional details like host, port, etc.
  userId: integer("user_id"), // Optional - which user triggered the connection test
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertConnectionHistorySchema = createInsertSchema(connectionHistory).pick({
  connectionType: true,
  status: true,
  message: true,
  details: true,
  userId: true,
});

export type ConnectionHistory = typeof connectionHistory.$inferSelect;
export type InsertConnectionHistory = z.infer<typeof insertConnectionHistorySchema>;

// Cost Matrix (simplified representation from Excel data)
export const costMatrix = pgTable("cost_matrix", {
  id: serial("id").primaryKey(),
  region: text("region").notNull(),
  buildingType: text("building_type").notNull(),
  buildingTypeDescription: text("building_type_description").notNull(),
  baseCost: decimal("base_cost", { precision: 14, scale: 2 }).notNull(),
  matrixYear: integer("matrix_year").notNull(),
  sourceMatrixId: integer("source_matrix_id").notNull(),
  matrixDescription: text("matrix_description").notNull(),   // Renamed from sourceMatrixDescription
  dataPoints: integer("data_points").notNull().default(0),
  minCost: decimal("min_cost", { precision: 14, scale: 2 }),
  maxCost: decimal("max_cost", { precision: 14, scale: 2 }),
  complexityFactorBase: decimal("complexity_factor_base", { precision: 5, scale: 2 }).notNull().default("1.0"),
  qualityFactorBase: decimal("quality_factor_base", { precision: 5, scale: 2 }).notNull().default("1.0"),
  conditionFactorBase: decimal("condition_factor_base", { precision: 5, scale: 2 }).notNull().default("1.0"),
  county: text("county"),  // County name for cross-county benchmarking
  state: text("state"),    // State name for cross-state benchmarking
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
  return {
    regionBuildingTypeIdx: uniqueIndex("region_building_type_year_idx").on(
      table.region, 
      table.buildingType,
      table.matrixYear
    ),
  };
});

export const insertCostMatrixSchema = createInsertSchema(costMatrix).pick({
  region: true,
  buildingType: true,
  buildingTypeDescription: true,
  baseCost: true,
  matrixYear: true,
  sourceMatrixId: true,
  matrixDescription: true,     // Updated to match the renamed field
  dataPoints: true,
  minCost: true,
  maxCost: true,
  complexityFactorBase: true,
  qualityFactorBase: true,
  conditionFactorBase: true,
  county: true,
  state: true,
  isActive: true,
});

export type CostMatrix = typeof costMatrix.$inferSelect;
export type InsertCostMatrix = z.infer<typeof insertCostMatrixSchema>;

// Cost Factor Presets
export const costFactorPresets = pgTable("cost_factor_presets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull(),
  weights: json("weights").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCostFactorPresetSchema = createInsertSchema(costFactorPresets).pick({
  name: true,
  description: true,
  userId: true,
  weights: true,
  isDefault: true,
});

export type CostFactorPreset = typeof costFactorPresets.$inferSelect;
export type InsertCostFactorPreset = z.infer<typeof insertCostFactorPresetSchema>;

// File Uploads
export const fileUploads = pgTable("file_uploads", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedBy: integer("uploaded_by").notNull(),
  status: text("status").notNull().default("pending"),
  processedItems: integer("processed_items").notNull().default(0),
  totalItems: integer("total_items"),
  errorCount: integer("error_count").notNull().default(0),
  errors: json("errors").default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFileUploadSchema = createInsertSchema(fileUploads).pick({
  fileName: true,
  fileType: true,
  fileSize: true,
  uploadedBy: true,
  status: true,
  processedItems: true,
  totalItems: true,
  errorCount: true,
  errors: true,
});

export type FileUpload = typeof fileUploads.$inferSelect;
export type InsertFileUpload = z.infer<typeof insertFileUploadSchema>;

// Collaboration Feature: Comments
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  targetType: text("target_type").notNull(), // "calculation", "cost_matrix", etc.
  targetId: integer("target_id").notNull(),
  content: text("content").notNull(),
  parentCommentId: integer("parent_comment_id"), // For threaded comments
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  isResolved: boolean("is_resolved").notNull().default(false),
  isEdited: boolean("is_edited").notNull().default(false),
}, (table) => {
  return {
    // Create a regular index (not unique) for faster lookups
    targetIdx: index("target_type_id_idx").on(
      table.targetType,
      table.targetId
    ),
  };
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  userId: true,
  targetType: true,
  targetId: true,
  content: true,
  parentCommentId: true,
  isResolved: true,
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

// Collaboration Feature: Shared Projects
export const sharedProjects = pgTable("shared_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdById: integer("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  status: text("status").notNull().default("active"),
  isPublic: boolean("is_public").notNull().default(false),
});

export const insertSharedProjectSchema = createInsertSchema(sharedProjects).pick({
  name: true,
  description: true,
  createdById: true,
  status: true,
  isPublic: true,
});

export type SharedProject = typeof sharedProjects.$inferSelect;
export type InsertSharedProject = z.infer<typeof insertSharedProjectSchema>;

// Collaboration Feature: Project Members
export const projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => sharedProjects.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull().default("viewer"), // viewer, editor, admin
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  invitedBy: integer("invited_by").notNull().references(() => users.id),
}, (table) => {
  return {
    memberUniqueIdx: uniqueIndex("project_user_idx").on(
      table.projectId,
      table.userId
    ),
  };
});

export const insertProjectMemberSchema = createInsertSchema(projectMembers).pick({
  projectId: true,
  userId: true,
  role: true,
  invitedBy: true,
});

export type ProjectMember = typeof projectMembers.$inferSelect;
export type InsertProjectMember = z.infer<typeof insertProjectMemberSchema>;

// Collaboration Feature: Project Invitations
export const projectInvitations = pgTable("project_invitations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => sharedProjects.id),
  userId: integer("user_id").notNull().references(() => users.id),
  invitedBy: integer("invited_by").notNull().references(() => users.id),
  role: text("role").notNull().default("viewer"), // viewer, editor, admin
  status: text("status").notNull().default("pending"), // pending, accepted, declined
  invitedAt: timestamp("invited_at").notNull().defaultNow(),
}, (table) => {
  return {
    invitationUniqueIdx: uniqueIndex("project_invitation_idx").on(
      table.projectId,
      table.userId
    ),
  };
});

export const insertProjectInvitationSchema = createInsertSchema(projectInvitations).pick({
  projectId: true,
  userId: true,
  invitedBy: true,
  role: true,
  status: true,
});

export type ProjectInvitation = typeof projectInvitations.$inferSelect;
export type InsertProjectInvitation = z.infer<typeof insertProjectInvitationSchema>;

// Collaboration Feature: Project Items
export const projectItems = pgTable("project_items", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => sharedProjects.id),
  itemType: text("item_type").notNull(), // calculation, cost_matrix, report
  itemId: integer("item_id").notNull(),
  addedBy: integer("added_by").notNull().references(() => users.id),
  addedAt: timestamp("added_at").notNull().defaultNow(),
}, (table) => {
  return {
    itemUniqueIdx: uniqueIndex("project_item_idx").on(
      table.projectId,
      table.itemType,
      table.itemId
    ),
  };
});

export const sharedLinks = pgTable("shared_links", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => sharedProjects.id),
  token: text("token").notNull().unique(),
  accessLevel: text("access_level").notNull().default("view"), // view, edit, admin
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").notNull().references(() => users.id),
  description: text("description"),
});

export const insertSharedLinkSchema = createInsertSchema(sharedLinks).pick({
  projectId: true,
  token: true,
  accessLevel: true,
  expiresAt: true,
  createdBy: true,
  description: true,
});

// Project Activities for tracking actions in a project
export const projectActivities = pgTable("project_activities", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => sharedProjects.id),
  userId: integer("user_id").notNull().references(() => users.id),
  activityType: text("activity_type").notNull(),
  activityData: json("activity_data").$type<any>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProjectActivitySchema = createInsertSchema(projectActivities).pick({
  projectId: true,
  userId: true,
  activityType: true,
  activityData: true,
});

export type SharedLink = typeof sharedLinks.$inferSelect;
export type InsertSharedLink = z.infer<typeof insertSharedLinkSchema>;

export type ProjectActivity = typeof projectActivities.$inferSelect;
export type InsertProjectActivity = z.infer<typeof insertProjectActivitySchema>;

export const insertProjectItemSchema = createInsertSchema(projectItems).pick({
  projectId: true,
  itemType: true,
  itemId: true,
  addedBy: true,
});

export type ProjectItem = typeof projectItems.$inferSelect;
export type InsertProjectItem = z.infer<typeof insertProjectItemSchema>;

// External API Integration: Materials API Cache
export const materialsPriceCache = pgTable("materials_price_cache", {
  id: serial("id").primaryKey(),
  materialCode: text("material_code").notNull(),
  source: text("source").notNull(), // API source
  region: text("region").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(),
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
  validUntil: timestamp("valid_until").notNull(),
  metadata: json("metadata"), // Additional data from the API
}, (table) => {
  return {
    materialCodeIdx: uniqueIndex("material_code_source_region_idx").on(
      table.materialCode,
      table.source,
      table.region
    ),
  };
});

export const insertMaterialsPriceCacheSchema = createInsertSchema(materialsPriceCache).pick({
  materialCode: true,
  source: true,
  region: true,
  price: true,
  unit: true,
  validUntil: true,
  metadata: true,
});

export type MaterialsPriceCache = typeof materialsPriceCache.$inferSelect;
export type InsertMaterialsPriceCache = z.infer<typeof insertMaterialsPriceCacheSchema>;

// What-If Scenarios
export const whatIfScenarios = pgTable("what_if_scenarios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  baseCalculationId: integer("base_calculation_id"),
  parameters: json("parameters").notNull(),
  results: json("results").notNull().default({}),
  isSaved: boolean("is_saved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWhatIfScenarioSchema = createInsertSchema(whatIfScenarios).pick({
  userId: true,
  name: true,
  description: true,
  baseCalculationId: true,
  parameters: true,
  results: true,
  isSaved: true,
});

export type WhatIfScenario = typeof whatIfScenarios.$inferSelect;
export type InsertWhatIfScenario = z.infer<typeof insertWhatIfScenarioSchema>;

// Scenario Variations (for tracking changes between scenarios)
export const scenarioVariations = pgTable("scenario_variations", {
  id: serial("id").primaryKey(),
  scenarioId: integer("scenario_id").notNull(),
  name: text("name").notNull(),
  parameterKey: text("parameter_key").notNull(),
  originalValue: json("original_value").notNull(),
  newValue: json("new_value").notNull(),
  impactValue: decimal("impact_value", { precision: 14, scale: 2 }),
  impactPercentage: decimal("impact_percentage", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertScenarioVariationSchema = createInsertSchema(scenarioVariations).pick({
  scenarioId: true,
  name: true,
  parameterKey: true,
  originalValue: true,
  newValue: true,
  impactValue: true,
  impactPercentage: true,
});

export type ScenarioVariation = typeof scenarioVariations.$inferSelect;
export type InsertScenarioVariation = z.infer<typeof insertScenarioVariationSchema>;

// Scenario Impact Analysis
export const scenarioImpacts = pgTable("scenario_impacts", {
  id: serial("id").primaryKey(),
  scenarioId: integer("scenario_id").notNull(),
  analysisType: text("analysis_type").notNull(),
  impactSummary: json("impact_summary").notNull(),
  calculatedAt: timestamp("calculated_at").notNull().defaultNow(),
});

export const insertScenarioImpactSchema = createInsertSchema(scenarioImpacts).pick({
  scenarioId: true,
  analysisType: true,
  impactSummary: true,
});

export type ScenarioImpact = typeof scenarioImpacts.$inferSelect;
export type InsertScenarioImpact = z.infer<typeof insertScenarioImpactSchema>;

// FTP Sync Schedules
export const syncSchedules = pgTable("sync_schedules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  connectionId: integer("connection_id").notNull(),
  source: jsonb("source").notNull(), // {type: 'ftp'|'local', path: string}
  destination: jsonb("destination").notNull(), // {type: 'ftp'|'local', path: string}
  frequency: text("frequency").notNull(), // 'hourly', 'daily', 'weekly', 'monthly', 'manual'
  time: text("time"), // HH:MM format for daily/weekly/monthly
  dayOfWeek: integer("day_of_week"), // 0-6 for weekly (0 = Sunday)
  dayOfMonth: integer("day_of_month"), // 1-31 for monthly
  options: jsonb("options").notNull().default({}), // {deleteAfterSync: boolean, overwriteExisting: boolean, includeSubfolders: boolean, filePatterns: string[]}
  enabled: boolean("enabled").notNull().default(true),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  status: text("status").default("idle"), // 'success', 'failed', 'running', 'idle'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSyncScheduleSchema = createInsertSchema(syncSchedules).pick({
  name: true,
  connectionId: true,
  source: true,
  destination: true,
  frequency: true,
  time: true,
  dayOfWeek: true,
  dayOfMonth: true,
  options: true,
  enabled: true,
  lastRun: true,
  nextRun: true,
  status: true,
});

// FTP Sync History
export const syncHistory = pgTable("sync_history", {
  id: serial("id").primaryKey(),
  scheduleId: integer("schedule_id").notNull(),
  connectionId: integer("connection_id").notNull(),
  scheduleName: text("schedule_name").notNull(),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  status: text("status").notNull(), // 'success', 'failed', 'running'
  filesTransferred: integer("files_transferred").notNull().default(0),
  totalBytes: integer("total_bytes").notNull().default(0),
  errors: text("errors").array().notNull().default([]),
  details: jsonb("details").notNull().default([]), // Array of {file: string, status: string, size: number, error?: string}
});

export const insertSyncHistorySchema = createInsertSchema(syncHistory).pick({
  scheduleId: true,
  connectionId: true,
  scheduleName: true,
  startTime: true,
  endTime: true,
  status: true,
  filesTransferred: true,
  totalBytes: true,
  errors: true,
  details: true,
});

export type SyncSchedule = typeof syncSchedules.$inferSelect;
export type InsertSyncSchedule = z.infer<typeof insertSyncScheduleSchema>;

export type SyncHistory = typeof syncHistory.$inferSelect;
export type InsertSyncHistory = z.infer<typeof insertSyncHistorySchema>;

// FTP Connections
export const ftpConnections = pgTable("ftp_connections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  host: text("host").notNull(),
  port: integer("port").notNull().default(21),
  username: text("username").notNull(),
  password: text("password").notNull(),
  secure: boolean("secure").notNull().default(false),
  passiveMode: boolean("passive_mode").notNull().default(true),
  defaultPath: text("default_path").default("/"),
  description: text("description"),
  lastConnected: timestamp("last_connected"),
  status: text("status").notNull().default("unknown"), // 'connected', 'disconnected', 'error', 'unknown'
  createdBy: integer("created_by").notNull(), // User ID of creator
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFTPConnectionSchema = createInsertSchema(ftpConnections).pick({
  name: true,
  host: true,
  port: true,
  username: true,
  password: true,
  secure: true,
  passiveMode: true,
  defaultPath: true,
  description: true,
  createdBy: true,
  isDefault: true,
});

export type FTPConnection = typeof ftpConnections.$inferSelect;
export type InsertFTPConnection = z.infer<typeof insertFTPConnectionSchema>;

// Export property data schema
export * from './property-schema';
