import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerSections = [
    {
      title: 'Perusahaan',
      links: [
        { name: 'Tentang Kami', href: '#' },
        { name: 'Karir', href: '#' },
        { name: 'Blog', href: '#' },
      ]
    },
    {
      title: 'Sumber Daya',
      links: [
        { name: 'Dokumentasi', href: '#' },
        { name: 'Pusat Bantuan', href: '#' },
        { name: 'Harga', href: '#' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Kebijakan Privasi', href: '#' },
        { name: 'Ketentuan Layanan', href: '#' },
        { name: 'Kebijakan Cookie', href: '#' },
      ]
    }
  ];
  
  const socialLinks = [
    { name: 'Facebook', href: '#', icon: 'F' },
    { name: 'Twitter', href: '#', icon: 'T' },
    { name: 'Instagram', href: '#', icon: 'I' },
    { name: 'GitHub', href: '#', icon: 'G' },
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
              Perusahaan
            </h3>
            <div className="mt-4 flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="h-10 w-10 bg-[#0600ad] rounded-md flex items-center justify-center mr-2"
              >
                <span className="text-white font-bold">A</span>
              </motion.div>
              <span className="text-lg font-bold text-gray-900">AppName</span>
            </div>
            <p className="mt-4 text-base text-gray-600">
              Membuat dunia lebih baik melalui solusi desain kreatif.
            </p>
            <div className="mt-4 flex space-x-3">
              {socialLinks.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className="text-gray-500 hover:text-[#0600ad]"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={item.name}
                >
                  <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-[#0600ad] hover:text-white transition-all">
                    {item.icon}
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>
          
          {footerSections.map((section, sectionIdx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (sectionIdx + 1) }}
            >
              <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-4">
                {section.links.map((item) => (
                  <li key={item.name}>
                    <motion.a
                      href={item.href}
                      className="text-base text-gray-600 hover:text-[#0600ad]"
                      whileHover={{ x: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {item.name}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-base text-gray-500">&copy; {currentYear} AppName, Inc. Semua hak dilindungi undang-undang.</p>
          <p className="mt-4 md:mt-0 text-sm text-gray-500">
            Dibuat dengan ❤️ oleh Tim AppName
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
