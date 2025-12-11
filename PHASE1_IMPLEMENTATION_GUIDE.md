# 🚀 Phase 1 Implementation Guide - Brand Memory System

## 📋 Overview

This guide provides step-by-step instructions for implementing the Brand Memory System - the foundation for intelligent, context-aware AI content generation.

---

## ✅ What's Already Done

### 1. Database Schema ✅
- **File:** `database/brand_memory_schema.sql`
- **Status:** Complete and ready to deploy
- **Tables Created:**
  - `brand_profiles` - Core brand information
  - `target_audiences` - Detailed audience personas
  - `products` - Product/service details
  - `campaigns` - Campaign history
  - `content_performance` - Performance tracking
  - `user_preferences` - Learning from user behavior
  - `content_templates` - Reusable templates

### 2. TypeScript Types ✅
- **File:** `types/brandMemory.ts`
- **Status:** Complete
- **Includes:** All interfaces and types for brand memory entities

### 3. Service Layer ✅
- **File:** `services/brandMemoryService.ts`
- **Status:** Complete
- **Features:**
  - CRUD operations for all entities
  - Brand context retrieval
  - Prompt enrichment
  - Analytics
  - Learning from edits

---

## 🛠️ Implementation Steps

### Step 1: Deploy Database Schema (15 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Run SQL Schema**
   - Go to SQL Editor
   - Copy contents of `database/brand_memory_schema.sql`
   - Paste and click "Run"
   - Verify all tables created successfully

3. **Verify Tables**
   ```sql
   -- Run this to verify
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'brand%' OR table_name LIKE '%template%';
   ```

4. **Test RLS Policies**
   ```sql
   -- Should return empty (no access without auth)
   SELECT * FROM brand_profiles;
   ```

---

### Step 2: Create Brand Setup UI (2-3 hours)

Create `components/BrandSetupView.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { brandMemoryService } from '../services/brandMemoryService';
import { BrandProfile, TargetAudience, Product } from '../types/brandMemory';
import * as Icons from 'lucide-react';
import { useToast } from '../context/ToastContext';

const BrandSetupView: React.FC = () => {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [brandForm, setBrandForm] = useState({
    brand_name: '',
    industry: '',
    website: '',
    description: '',
    tone_adjectives: [] as string[],
    voice_description: '',
    vocabulary_preferences: [] as string[],
    vocabulary_avoid: [] as string[],
    writing_style: ''
  });

  const [audienceForm, setAudienceForm] = useState({
    persona_name: '',
    description: '',
    age_range: '',
    pain_points: [] as string[],
    core_desires: [] as string[],
    goals: [] as string[],
    common_objections: [] as string[]
  });

  const [productForm, setProductForm] = useState({
    product_name: '',
    description: '',
    tagline: '',
    unique_selling_points: [] as string[],
    price_point: ''
  });

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const data = await brandMemoryService.getBrandProfiles();
      setBrands(data);
      if (data.length > 0) {
        setSelectedBrand(data[0]);
      }
    } catch (error) {
      console.error('Failed to load brands:', error);
    }
  };

  const handleCreateBrand = async () => {
    setLoading(true);
    try {
      const brand = await brandMemoryService.createBrandProfile(brandForm);
      setBrands([...brands, brand]);
      setSelectedBrand(brand);
      showToast('Brand profile created successfully!', 'success');
      setStep(2);
    } catch (error: any) {
      showToast(error.message || 'Failed to create brand', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAudience = async () => {
    if (!selectedBrand) return;
    
    setLoading(true);
    try {
      await brandMemoryService.createTargetAudience({
        brand_id: selectedBrand.id,
        ...audienceForm,
        is_primary: true
      });
      showToast('Target audience created successfully!', 'success');
      setStep(3);
    } catch (error: any) {
      showToast(error.message || 'Failed to create audience', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!selectedBrand) return;
    
    setLoading(true);
    try {
      await brandMemoryService.createProduct({
        brand_id: selectedBrand.id,
        ...productForm,
        features: [],
        competitive_advantages: [],
        competitors: []
      });
      showToast('Product created successfully!', 'success');
      showToast('Brand setup complete! AI will now use this context.', 'success');
      // Navigate to dashboard or close modal
    } catch (error: any) {
      showToast(error.message || 'Failed to create product', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Render step-by-step wizard
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map(num => (
          <div key={num} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= num ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {num}
            </div>
            {num < 3 && <div className={`w-24 h-1 ${step > num ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Brand Profile */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Create Brand Profile</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">Brand Name *</label>
            <input
              type="text"
              value={brandForm.brand_name}
              onChange={(e) => setBrandForm({...brandForm, brand_name: e.target.value})}
              className="w-full p-3 border rounded-lg"
              placeholder="e.g., RevenuePilot"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Industry</label>
            <input
              type="text"
              value={brandForm.industry}
              onChange={(e) => setBrandForm({...brandForm, industry: e.target.value})}
              className="w-full p-3 border rounded-lg"
              placeholder="e.g., SaaS, E-commerce, Consulting"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Brand Voice Description</label>
            <textarea
              value={brandForm.voice_description}
              onChange={(e) => setBrandForm({...brandForm, voice_description: e.target.value})}
              className="w-full p-3 border rounded-lg"
              rows={4}
              placeholder="Describe how your brand communicates..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tone (select multiple)</label>
            <div className="flex flex-wrap gap-2">
              {['Professional', 'Friendly', 'Witty', 'Urgent', 'Luxury', 'Casual'].map(tone => (
                <button
                  key={tone}
                  onClick={() => {
                    const tones = brandForm.tone_adjectives.includes(tone)
                      ? brandForm.tone_adjectives.filter(t => t !== tone)
                      : [...brandForm.tone_adjectives, tone];
                    setBrandForm({...brandForm, tone_adjectives: tones});
                  }}
                  className={`px-4 py-2 rounded-full text-sm ${
                    brandForm.tone_adjectives.includes(tone)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreateBrand}
            disabled={loading || !brandForm.brand_name}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Next: Target Audience'}
          </button>
        </div>
      )}

      {/* Step 2: Target Audience */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Define Target Audience</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">Persona Name *</label>
            <input
              type="text"
              value={audienceForm.persona_name}
              onChange={(e) => setAudienceForm({...audienceForm, persona_name: e.target.value})}
              className="w-full p-3 border rounded-lg"
              placeholder="e.g., Tech-Savvy Marketer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Age Range</label>
            <input
              type="text"
              value={audienceForm.age_range}
              onChange={(e) => setAudienceForm({...audienceForm, age_range: e.target.value})}
              className="w-full p-3 border rounded-lg"
              placeholder="e.g., 25-45"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Pain Points (comma-separated)</label>
            <textarea
              value={audienceForm.pain_points.join(', ')}
              onChange={(e) => setAudienceForm({
                ...audienceForm, 
                pain_points: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              className="w-full p-3 border rounded-lg"
              rows={3}
              placeholder="e.g., Not enough time, High costs, Complex tools"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Core Desires (comma-separated)</label>
            <textarea
              value={audienceForm.core_desires.join(', ')}
              onChange={(e) => setAudienceForm({
                ...audienceForm,
                core_desires: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              className="w-full p-3 border rounded-lg"
              rows={3}
              placeholder="e.g., Save time, Increase revenue, Simplify workflows"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-medium hover:bg-slate-300"
            >
              Back
            </button>
            <button
              onClick={handleCreateAudience}
              disabled={loading || !audienceForm.persona_name}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Next: Product Info'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Product */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Add Product/Service</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">Product Name *</label>
            <input
              type="text"
              value={productForm.product_name}
              onChange={(e) => setProductForm({...productForm, product_name: e.target.value})}
              className="w-full p-3 border rounded-lg"
              placeholder="e.g., RevenuePilot Pro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={productForm.description}
              onChange={(e) => setProductForm({...productForm, description: e.target.value})}
              className="w-full p-3 border rounded-lg"
              rows={3}
              placeholder="What does your product do?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tagline</label>
            <input
              type="text"
              value={productForm.tagline}
              onChange={(e) => setProductForm({...productForm, tagline: e.target.value})}
              className="w-full p-3 border rounded-lg"
              placeholder="e.g., AI-Powered Marketing in Minutes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Unique Selling Points (comma-separated)</label>
            <textarea
              value={productForm.unique_selling_points.join(', ')}
              onChange={(e) => setProductForm({
                ...productForm,
                unique_selling_points: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              className="w-full p-3 border rounded-lg"
              rows={3}
              placeholder="e.g., 10x faster, 99.9% uptime, No credit card required"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price Point</label>
            <input
              type="text"
              value={productForm.price_point}
              onChange={(e) => setProductForm({...productForm, price_point: e.target.value})}
              className="w-full p-3 border rounded-lg"
              placeholder="e.g., $99/month"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(2)}
              className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-medium hover:bg-slate-300"
            >
              Back
            </button>
            <button
              onClick={handleCreateProduct}
              disabled={loading || !productForm.product_name}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Complete Setup'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandSetupView;
```

---

### Step 3: Integrate with Existing Agents (1-2 hours)

Update `services/geminiService.ts` to use brand context:

```typescript
import { brandMemoryService } from './brandMemoryService';

// Add to generateContent function
export async function generateContent(
  agentId: string,
  inputs: Record<string, any>,
  brandId?: string // NEW PARAMETER
): Promise<string> {
  // ... existing code ...

  let finalPrompt = prompt;

  // NEW: Enrich with brand context if brandId provided
  if (brandId) {
    try {
      const context = await brandMemoryService.getBrandContext(brandId);
      const enriched = brandMemoryService.enrichPrompt(prompt, context);
      finalPrompt = enriched.enrichedPrompt;
      
      console.log('🧠 Using brand context for generation');
    } catch (error) {
      console.warn('Failed to load brand context:', error);
      // Continue with original prompt
    }
  }

  // ... rest of existing code ...
}
```

---

### Step 4: Update Agent Workspace (1 hour)

Update `components/AgentWorkspace.tsx`:

```typescript
// Add brand selector
const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
const [brands, setBrands] = useState<BrandProfile[]>([]);

useEffect(() => {
  loadBrands();
}, []);

const loadBrands = async () => {
  const data = await brandMemoryService.getBrandProfiles();
  setBrands(data);
  if (data.length > 0) {
    setSelectedBrandId(data[0].id);
  }
};

// Update generate function
const handleGenerate = async () => {
  // ... existing code ...
  
  const content = await generateContent(
    agent.id,
    formData,
    selectedBrandId // Pass brand ID
  );
  
  // ... rest of code ...
};

// Add brand selector UI
<div className="mb-4">
  <label className="block text-sm font-medium mb-2">
    Brand Context (Optional)
  </label>
  <select
    value={selectedBrandId || ''}
    onChange={(e) => setSelectedBrandId(e.target.value || null)}
    className="w-full p-2 border rounded-lg"
  >
    <option value="">No brand context</option>
    {brands.map(brand => (
      <option key={brand.id} value={brand.id}>
        {brand.brand_name}
      </option>
    ))}
  </select>
  {selectedBrandId && (
    <p className="text-xs text-slate-500 mt-1">
      ✨ AI will use your brand voice and context
    </p>
  )}
</div>
```

---

### Step 5: Add Brand Management to Settings (1 hour)

Update `components/SettingsView.tsx` to include brand management section.

---

### Step 6: Testing (1 hour)

1. **Test Brand Creation**
   - Create a brand profile
   - Add target audience
   - Add product
   - Verify data in Supabase

2. **Test Context Enrichment**
   - Generate content without brand context
   - Generate content with brand context
   - Compare results
   - Verify brand voice is maintained

3. **Test Learning**
   - Edit generated content
   - Verify edits are tracked
   - Generate similar content
   - Check if AI learns from edits

---

## 📊 Success Metrics

### Immediate (Week 1)
- [ ] Database schema deployed
- [ ] Brand setup UI working
- [ ] At least 1 test brand created
- [ ] Context enrichment working

### Short-term (Month 1)
- [ ] 50% of users create brand profiles
- [ ] 30% improvement in content quality (user feedback)
- [ ] 20% reduction in edit time

### Long-term (Month 3)
- [ ] 80% of users use brand context
- [ ] 50% improvement in content quality
- [ ] 40% reduction in edit time
- [ ] Positive user feedback on consistency

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Run database schema in Supabase
- [ ] Test all CRUD operations
- [ ] Verify RLS policies work
- [ ] Test brand context enrichment
- [ ] Create sample brand for demo

### Deployment
- [ ] Deploy code to Vercel
- [ ] Verify no errors in production
- [ ] Test brand creation flow
- [ ] Test content generation with context

### Post-Deployment
- [ ] Monitor error logs
- [ ] Collect user feedback
- [ ] Track usage metrics
- [ ] Iterate based on feedback

---

## 💡 Next Steps After Phase 1

Once Brand Memory is working:

1. **Add Image Generation** (Week 2-3)
   - Integrate DALL-E 3 or Stable Diffusion
   - Use brand colors/style in images

2. **Add Content Optimizer** (Week 4-5)
   - Real-time content scoring
   - SEO suggestions
   - Readability analysis

3. **Add Smart Templates** (Week 6-7)
   - Pre-built workflows
   - Template marketplace
   - User-generated templates

---

## 📞 Support

If you encounter issues:

1. Check Supabase logs
2. Check browser console
3. Verify RLS policies
4. Test with demo user
5. Open GitHub issue with details

---

**Ready to transform RevenuePilot into an intelligent AI platform! 🚀**
