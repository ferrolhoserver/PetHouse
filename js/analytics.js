/**
 * Sistema de Coleta de Estatísticas para Power BI
 * Coleta dados agregados e anonimizados para análise e desenvolvimento
 */

const Analytics = {
    STORAGE_KEY: 'pethouse_analytics',
    LAST_SYNC_KEY: 'pethouse_last_sync',
    SYNC_INTERVAL: 24 * 60 * 60 * 1000, // 24 horas
    
    /**
     * Inicializa o sistema de analytics
     */
    init() {
        // Verificar consentimento
        if (!window.ConsentManager?.hasConsent()) {
            console.log('📊 Analytics: Aguardando consentimento');
            return;
        }
        
        console.log('📊 Analytics: Inicializado');
        
        // Registrar sessão
        this.trackSession();
        
        // Verificar se precisa sincronizar
        this.checkAndSync();
    },
    
    /**
     * Verifica se deve sincronizar e executa
     */
    async checkAndSync() {
        const lastSync = localStorage.getItem(this.LAST_SYNC_KEY);
        const now = Date.now();
        
        if (!lastSync || (now - parseInt(lastSync)) > this.SYNC_INTERVAL) {
            await this.syncToServer();
        }
    },
    
    /**
     * Registra uma sessão de uso
     */
    trackSession() {
        const session = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            platform: navigator.platform,
            deviceType: this.getDeviceType(),
            browser: this.getBrowserInfo()
        };
        
        this.saveEvent('session', session);
    },
    
    /**
     * Registra uma ação do usuário
     */
    trackAction(action, data = {}) {
        if (!window.ConsentManager?.hasConsent()) return;
        
        const event = {
            type: 'action',
            action,
            data,
            timestamp: new Date().toISOString()
        };
        
        this.saveEvent('action', event);
    },
    
    /**
     * Coleta estatísticas agregadas dos dados
     */
    collectAggregateStats() {
        if (!window.app?.data) return null;
        
        const data = window.app.data;
        const pets = data.pets || [];
        
        // Estatísticas de pets
        const petStats = this.analyzePets(pets);
        
        // Estatísticas de vacinas
        const vaccineStats = this.analyzeVaccines(pets);
        
        // Estatísticas de vermífugos
        const dewormerStats = this.analyzeDewormers(pets);
        
        // Estatísticas de peso
        const weightStats = this.analyzeWeights(pets);
        
        // Estatísticas de cios
        const heatStats = this.analyzeHeats(pets);
        
        // Estatísticas de consultas/cirurgias
        const medicalStats = this.analyzeMedical(pets);
        
        // Estatísticas de uso
        const usageStats = this.analyzeUsage();
        
        return {
            timestamp: new Date().toISOString(),
            familyId: data.familyId || 'unknown',
            totalPets: pets.length,
            petStats,
            vaccineStats,
            dewormerStats,
            weightStats,
            heatStats,
            medicalStats,
            usageStats,
            deviceInfo: {
                deviceType: this.getDeviceType(),
                browser: this.getBrowserInfo(),
                platform: navigator.platform,
                language: navigator.language
            }
        };
    },
    
    /**
     * Analisa estatísticas de pets
     */
    analyzePets(pets) {
        const bySpecies = {};
        const byBreed = {};
        const byGender = {};
        const ageGroups = {
            '0-1': 0,
            '1-3': 0,
            '3-7': 0,
            '7+': 0
        };
        
        pets.forEach(pet => {
            // Por espécie
            const species = pet.especie || 'unknown';
            bySpecies[species] = (bySpecies[species] || 0) + 1;
            
            // Por raça
            const breed = pet.raca || 'unknown';
            const key = `${species}:${breed}`;
            byBreed[key] = (byBreed[key] || 0) + 1;
            
            // Por sexo
            const gender = pet.sexo || 'unknown';
            byGender[gender] = (byGender[gender] || 0) + 1;
            
            // Por idade
            if (pet.dataNascimento) {
                const age = this.calculateAge(pet.dataNascimento);
                if (age < 1) ageGroups['0-1']++;
                else if (age < 3) ageGroups['1-3']++;
                else if (age < 7) ageGroups['3-7']++;
                else ageGroups['7+']++;
            }
        });
        
        return {
            bySpecies,
            byBreed,
            byGender,
            ageGroups
        };
    },
    
    /**
     * Analisa estatísticas de vacinas
     */
    analyzeVaccines(pets) {
        const vaccineTypes = {};
        let totalVaccines = 0;
        const petsWith Vaccines = pets.filter(p => p.vacinas && p.vacinas.length > 0).length;
        
        pets.forEach(pet => {
            if (pet.vacinas) {
                pet.vacinas.forEach(vaccine => {
                    const name = vaccine.nome || 'unknown';
                    vaccineTypes[name] = (vaccineTypes[name] || 0) + 1;
                    totalVaccines++;
                });
            }
        });
        
        return {
            total: totalVaccines,
            petsWithVaccines,
            averagePerPet: pets.length > 0 ? (totalVaccines / pets.length).toFixed(2) : 0,
            byType: vaccineTypes
        };
    },
    
    /**
     * Analisa estatísticas de vermífugos
     */
    analyzeDewormers(pets) {
        const dewormerTypes = {};
        let totalDewormers = 0;
        const petsWithDewormers = pets.filter(p => p.vermifugos && p.vermifugos.length > 0).length;
        
        pets.forEach(pet => {
            if (pet.vermifugos) {
                pet.vermifugos.forEach(dewormer => {
                    const name = dewormer.nome || 'unknown';
                    dewormerTypes[name] = (dewormerTypes[name] || 0) + 1;
                    totalDewormers++;
                });
            }
        });
        
        return {
            total: totalDewormers,
            petsWithDewormers,
            averagePerPet: pets.length > 0 ? (totalDewormers / pets.length).toFixed(2) : 0,
            byType: dewormerTypes
        };
    },
    
    /**
     * Analisa estatísticas de peso
     */
    analyzeWeights(pets) {
        const weightRanges = {
            '0-5kg': 0,
            '5-10kg': 0,
            '10-20kg': 0,
            '20-30kg': 0,
            '30+kg': 0
        };
        
        let totalWeightRecords = 0;
        
        pets.forEach(pet => {
            if (pet.peso) {
                const weight = parseFloat(pet.peso);
                if (!isNaN(weight)) {
                    if (weight < 5) weightRanges['0-5kg']++;
                    else if (weight < 10) weightRanges['5-10kg']++;
                    else if (weight < 20) weightRanges['10-20kg']++;
                    else if (weight < 30) weightRanges['20-30kg']++;
                    else weightRanges['30+kg']++;
                }
            }
            
            if (pet.historicoPeso) {
                totalWeightRecords += pet.historicoPeso.length;
            }
        });
        
        return {
            totalRecords: totalWeightRecords,
            byRange: weightRanges
        };
    },
    
    /**
     * Analisa estatísticas de cios
     */
    analyzeHeats(pets) {
        let totalHeats = 0;
        let totalBreedings = 0;
        const avgIntervals = [];
        
        pets.forEach(pet => {
            if (pet.cios && pet.cios.length > 0) {
                totalHeats += pet.cios.length;
                
                pet.cios.forEach(heat => {
                    if (heat.cruzamento) {
                        totalBreedings++;
                    }
                });
                
                // Calcular intervalo médio
                if (pet.cios.length > 1) {
                    const sorted = [...pet.cios].sort((a, b) => 
                        new Date(a.dataInicio) - new Date(b.dataInicio)
                    );
                    
                    for (let i = 1; i < sorted.length; i++) {
                        const prev = new Date(sorted[i-1].dataInicio);
                        const curr = new Date(sorted[i].dataInicio);
                        const days = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));
                        avgIntervals.push(days);
                    }
                }
            }
        });
        
        const avgInterval = avgIntervals.length > 0 
            ? Math.round(avgIntervals.reduce((a, b) => a + b, 0) / avgIntervals.length)
            : 0;
        
        return {
            totalHeats,
            totalBreedings,
            breedingRate: totalHeats > 0 ? ((totalBreedings / totalHeats) * 100).toFixed(1) : 0,
            averageInterval: avgInterval
        };
    },
    
    /**
     * Analisa estatísticas médicas
     */
    analyzeMedical(pets) {
        let totalConsultas = 0;
        let totalCirurgias = 0;
        let totalDiagnosticos = 0;
        const diagnosisTypes = {};
        const surgeryTypes = {};
        
        pets.forEach(pet => {
            if (pet.consultas) totalConsultas += pet.consultas.length;
            
            if (pet.cirurgias) {
                totalCirurgias += pet.cirurgias.length;
                pet.cirurgias.forEach(surgery => {
                    const type = surgery.tipo || 'unknown';
                    surgeryTypes[type] = (surgeryTypes[type] || 0) + 1;
                });
            }
            
            if (pet.diagnosticos) {
                totalDiagnosticos += pet.diagnosticos.length;
                pet.diagnosticos.forEach(diagnosis => {
                    const type = diagnosis.diagnostico || 'unknown';
                    diagnosisTypes[type] = (diagnosisTypes[type] || 0) + 1;
                });
            }
        });
        
        return {
            totalConsultas,
            totalCirurgias,
            totalDiagnosticos,
            diagnosisTypes,
            surgeryTypes
        };
    },
    
    /**
     * Analisa estatísticas de uso
     */
    analyzeUsage() {
        const events = this.getStoredEvents();
        const actions = events.filter(e => e.type === 'action');
        const sessions = events.filter(e => e.type === 'session');
        
        const actionCounts = {};
        actions.forEach(action => {
            const name = action.action;
            actionCounts[name] = (actionCounts[name] || 0) + 1;
        });
        
        return {
            totalSessions: sessions.length,
            totalActions: actions.length,
            actionCounts,
            lastActivity: events.length > 0 ? events[events.length - 1].timestamp : null
        };
    },
    
    /**
     * Salva um evento
     */
    saveEvent(type, data) {
        try {
            const events = this.getStoredEvents();
            events.push({ type, ...data });
            
            // Manter apenas últimos 1000 eventos
            if (events.length > 1000) {
                events.splice(0, events.length - 1000);
            }
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
        } catch (e) {
            console.error('Erro ao salvar evento de analytics:', e);
        }
    },
    
    /**
     * Obtém eventos armazenados
     */
    getStoredEvents() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Erro ao ler eventos de analytics:', e);
            return [];
        }
    },
    
    /**
     * Sincroniza dados com servidor
     */
    async syncToServer() {
        if (!window.ConsentManager?.hasConsent()) {
            console.log('📊 Analytics: Sem consentimento para sync');
            return;
        }
        
        const stats = this.collectAggregateStats();
        if (!stats) {
            console.log('📊 Analytics: Sem dados para sync');
            return;
        }
        
        try {
            console.log('📊 Analytics: Sincronizando...', stats);
            
            // TODO: Implementar envio para Supabase
            // await this.sendToSupabase(stats);
            
            // Por enquanto, apenas log
            console.log('📊 Analytics: Dados coletados:', stats);
            
            // Atualizar timestamp de última sincronização
            localStorage.setItem(this.LAST_SYNC_KEY, Date.now().toString());
            
            console.log('✅ Analytics: Sincronização concluída');
        } catch (error) {
            console.error('❌ Analytics: Erro ao sincronizar:', error);
        }
    },
    
    /**
     * Envia dados para Supabase
     */
    async sendToSupabase(stats) {
        // TODO: Implementar quando Supabase estiver configurado
        // const { data, error } = await supabase
        //     .from('analytics_stats')
        //     .insert([stats]);
        
        // if (error) throw error;
    },
    
    /**
     * Utilitários
     */
    calculateAge(birthDate) {
        const birth = new Date(birthDate);
        const now = new Date();
        const diff = now - birth;
        return diff / (1000 * 60 * 60 * 24 * 365.25);
    },
    
    getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return 'tablet';
        }
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return 'mobile';
        }
        return 'desktop';
    },
    
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'unknown';
        
        if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
        else if (ua.indexOf('SamsungBrowser') > -1) browser = 'Samsung';
        else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) browser = 'Opera';
        else if (ua.indexOf('Trident') > -1) browser = 'IE';
        else if (ua.indexOf('Edge') > -1) browser = 'Edge';
        else if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
        else if (ua.indexOf('Safari') > -1) browser = 'Safari';
        
        return browser;
    }
};

// Exportar para uso global
window.Analytics = Analytics;
