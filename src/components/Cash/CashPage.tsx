@@ .. @@
   const canManageCash = user?.role === 'administrador-all' || user?.role === 'administrador';
+  const canCloseCash = user?.role === 'administrador-all' || user?.role === 'administrador' || user?.role === 'whatsapp';