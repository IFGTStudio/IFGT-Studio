# IFGT Studio - Kurulum Kılavuzu

## 1. Supabase Bağlantısı Kurulumu
1. Supabase hesabınıza giriş yapın: https://supabase.com
2. Yeni bir proje oluşturun
3. Proje ayarlarından "Project URL" ve "anon public" anahtarınızı kopyalayın
4. Proje kök dizininde bir `.env` dosyası oluşturun:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Migration dosyalarını Supabase SQL Editor üzerinde çalıştırın:
   - `supabase/migrations/20260714_ifgt_id_hardening.sql`
   - `supabase/migrations/20260714_cms_professional.sql`
   - `supabase/schema.sql`

## 2. Admin Hesabı Oluşturma
1. IFGT ID ile kayıt olun (veya giriş yapın)
2. Supabase SQL Editor üzerinde aşağıdaki sorguyu çalıştırın (e-postanızı girin):
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
   ```

## 3. Yerel Geliştirme Sunucusunu Başlatma
```bash
npm install
npm run dev
```

## 4. Siteyi Canlıya Alma
Vercel üzerinden otomatik deploy yapabilirsiniz!
