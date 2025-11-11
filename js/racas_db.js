/**
 * Banco de dados de raças por espécie
 * Inclui raças populares e características relevantes para alertas
 */

const RacasDB = {
    Cachorro: [
        // Raças grandes (maior risco de displasia, torção gástrica)
        { nome: 'Labrador Retriever', porte: 'grande', braquicefalico: false },
        { nome: 'Golden Retriever', porte: 'grande', braquicefalico: false },
        { nome: 'Pastor Alemão', porte: 'grande', braquicefalico: false },
        { nome: 'Rottweiler', porte: 'grande', braquicefalico: false },
        { nome: 'Boxer', porte: 'grande', braquicefalico: true },
        { nome: 'Dogue Alemão', porte: 'gigante', braquicefalico: false },
        { nome: 'São Bernardo', porte: 'gigante', braquicefalico: false },
        { nome: 'Fila Brasileiro', porte: 'grande', braquicefalico: false },
        { nome: 'Dobermann', porte: 'grande', braquicefalico: false },
        { nome: 'Husky Siberiano', porte: 'grande', braquicefalico: false },
        { nome: 'Bernese Mountain Dog', porte: 'grande', braquicefalico: false },
        { nome: 'Mastiff', porte: 'gigante', braquicefalico: true },
        
        // Raças médias
        { nome: 'Beagle', porte: 'medio', braquicefalico: false },
        { nome: 'Cocker Spaniel', porte: 'medio', braquicefalico: false },
        { nome: 'Border Collie', porte: 'medio', braquicefalico: false },
        { nome: 'Pit Bull', porte: 'medio', braquicefalico: false },
        { nome: 'Staffordshire Bull Terrier', porte: 'medio', braquicefalico: false },
        { nome: 'Shar Pei', porte: 'medio', braquicefalico: true },
        { nome: 'Chow Chow', porte: 'medio', braquicefalico: true },
        { nome: 'Basenji', porte: 'medio', braquicefalico: false },
        { nome: 'Whippet', porte: 'medio', braquicefalico: false },
        
        // Raças pequenas
        { nome: 'Poodle (Toy/Miniatura)', porte: 'pequeno', braquicefalico: false },
        { nome: 'Yorkshire Terrier', porte: 'pequeno', braquicefalico: false },
        { nome: 'Chihuahua', porte: 'pequeno', braquicefalico: false },
        { nome: 'Shih Tzu', porte: 'pequeno', braquicefalico: true },
        { nome: 'Maltês', porte: 'pequeno', braquicefalico: false },
        { nome: 'Lhasa Apso', porte: 'pequeno', braquicefalico: true },
        { nome: 'Pinscher', porte: 'pequeno', braquicefalico: false },
        { nome: 'Spitz Alemão (Lulu da Pomerânia)', porte: 'pequeno', braquicefalico: false },
        { nome: 'Dachshund (Salsicha)', porte: 'pequeno', braquicefalico: false },
        { nome: 'Jack Russell Terrier', porte: 'pequeno', braquicefalico: false },
        { nome: 'West Highland White Terrier', porte: 'pequeno', braquicefalico: false },
        { nome: 'Schnauzer Miniatura', porte: 'pequeno', braquicefalico: false },
        { nome: 'Papillon', porte: 'pequeno', braquicefalico: false },
        { nome: 'Cavalier King Charles Spaniel', porte: 'pequeno', braquicefalico: true },
        
        // Raças braquicefálicas (problemas respiratórios)
        { nome: 'Pug', porte: 'pequeno', braquicefalico: true },
        { nome: 'Bulldog Francês', porte: 'pequeno', braquicefalico: true },
        { nome: 'Bulldog Inglês', porte: 'medio', braquicefalico: true },
        { nome: 'Boston Terrier', porte: 'pequeno', braquicefalico: true },
        { nome: 'Pequinês', porte: 'pequeno', braquicefalico: true },
        
        // Outras raças populares
        { nome: 'Akita', porte: 'grande', braquicefalico: false },
        { nome: 'Dálmata', porte: 'grande', braquicefalico: false },
        { nome: 'Weimaraner', porte: 'grande', braquicefalico: false },
        { nome: 'Setter Irlandês', porte: 'grande', braquicefalico: false },
        { nome: 'Pointer', porte: 'grande', braquicefalico: false },
        { nome: 'Vizsla', porte: 'grande', braquicefalico: false },
        { nome: 'Rhodesian Ridgeback', porte: 'grande', braquicefalico: false },
        { nome: 'Bichon Frisé', porte: 'pequeno', braquicefalico: false },
        { nome: 'Shiba Inu', porte: 'medio', braquicefalico: false },
        { nome: 'SRD (Sem Raça Definida)', porte: 'variado', braquicefalico: false }
    ],
    
    Gato: [
        // Raças populares
        { nome: 'Persa', pelo: 'longo', braquicefalico: true },
        { nome: 'Siamês', pelo: 'curto', braquicefalico: false },
        { nome: 'Maine Coon', pelo: 'longo', braquicefalico: false },
        { nome: 'Ragdoll', pelo: 'longo', braquicefalico: false },
        { nome: 'British Shorthair', pelo: 'curto', braquicefalico: false },
        { nome: 'Sphynx (Pelado)', pelo: 'sem', braquicefalico: false },
        { nome: 'Bengal', pelo: 'curto', braquicefalico: false },
        { nome: 'Scottish Fold', pelo: 'curto', braquicefalico: false },
        { nome: 'Abissínio', pelo: 'curto', braquicefalico: false },
        { nome: 'Birmanês', pelo: 'longo', braquicefalico: false },
        { nome: 'Exótico', pelo: 'curto', braquicefalico: true },
        { nome: 'Himalaio', pelo: 'longo', braquicefalico: true },
        { nome: 'Angorá', pelo: 'longo', braquicefalico: false },
        { nome: 'Norueguês da Floresta', pelo: 'longo', braquicefalico: false },
        { nome: 'Sagrado da Birmânia', pelo: 'longo', braquicefalico: false },
        { nome: 'Cornish Rex', pelo: 'curto', braquicefalico: false },
        { nome: 'Devon Rex', pelo: 'curto', braquicefalico: false },
        { nome: 'Munchkin', pelo: 'variado', braquicefalico: false },
        { nome: 'Russian Blue', pelo: 'curto', braquicefalico: false },
        { nome: 'Oriental', pelo: 'curto', braquicefalico: false },
        { nome: 'Tonquinês', pelo: 'curto', braquicefalico: false },
        { nome: 'Burmês', pelo: 'curto', braquicefalico: false },
        { nome: 'Chartreux', pelo: 'curto', braquicefalico: false },
        { nome: 'Korat', pelo: 'curto', braquicefalico: false },
        { nome: 'Manx', pelo: 'curto', braquicefalico: false },
        { nome: 'SRD (Sem Raça Definida)', pelo: 'variado', braquicefalico: false }
    ],
    
    Pássaro: [
        { nome: 'Calopsita', tipo: 'psitacídeo' },
        { nome: 'Periquito Australiano', tipo: 'psitacídeo' },
        { nome: 'Papagaio', tipo: 'psitacídeo' },
        { nome: 'Arara', tipo: 'psitacídeo' },
        { nome: 'Cacatua', tipo: 'psitacídeo' },
        { nome: 'Agapornis (Inseparável)', tipo: 'psitacídeo' },
        { nome: 'Canário', tipo: 'passeriforme' },
        { nome: 'Manon', tipo: 'passeriforme' },
        { nome: 'Diamante de Gould', tipo: 'passeriforme' },
        { nome: 'Coleiro', tipo: 'passeriforme' },
        { nome: 'Trinca-Ferro', tipo: 'passeriforme' },
        { nome: 'Curió', tipo: 'passeriforme' },
        { nome: 'Outro', tipo: 'outro' }
    ],
    
    Réptil: [
        // Tartarugas e cágados
        { nome: 'Tartaruga Tigre d\'água', tipo: 'aquático' },
        { nome: 'Tartaruga de Ouvido Vermelho', tipo: 'aquático' },
        { nome: 'Jabuti Piranga', tipo: 'terrestre' },
        { nome: 'Jabuti Tinga', tipo: 'terrestre' },
        
        // Lagartos
        { nome: 'Iguana Verde', tipo: 'lagarto' },
        { nome: 'Pogona (Dragão Barbudo)', tipo: 'lagarto' },
        { nome: 'Gecko Leopardo', tipo: 'lagarto' },
        { nome: 'Teiú', tipo: 'lagarto' },
        { nome: 'Camaleão', tipo: 'lagarto' },
        
        // Cobras
        { nome: 'Corn Snake (Cobra do Milho)', tipo: 'serpente' },
        { nome: 'Jiboia', tipo: 'serpente' },
        { nome: 'Píton Bola', tipo: 'serpente' },
        
        { nome: 'Outro', tipo: 'outro' }
    ],
    
    Roedor: [
        { nome: 'Hamster Sírio', tipo: 'hamster' },
        { nome: 'Hamster Anão Russo', tipo: 'hamster' },
        { nome: 'Hamster Chinês', tipo: 'hamster' },
        { nome: 'Porquinho-da-índia', tipo: 'porquinho' },
        { nome: 'Rato Twister', tipo: 'rato' },
        { nome: 'Camundongo', tipo: 'camundongo' },
        { nome: 'Gerbil', tipo: 'gerbil' },
        { nome: 'Chinchila', tipo: 'chinchila' },
        { nome: 'Outro', tipo: 'outro' }
    ],
    
    Coelho: [
        { nome: 'Mini Lion', porte: 'pequeno' },
        { nome: 'Mini Lop', porte: 'pequeno' },
        { nome: 'Anão Holandês', porte: 'pequeno' },
        { nome: 'Rex', porte: 'medio' },
        { nome: 'Fuzzy Lop', porte: 'pequeno' },
        { nome: 'Gigante de Flandres', porte: 'grande' },
        { nome: 'Nova Zelândia', porte: 'grande' },
        { nome: 'Hotot', porte: 'pequeno' },
        { nome: 'SRD (Sem Raça Definida)', porte: 'variado' }
    ],
    
    Outro: [
        { nome: 'Não especificado' }
    ]
};

// Exportar para uso global
window.RacasDB = RacasDB;
