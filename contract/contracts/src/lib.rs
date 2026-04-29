#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype,
    token::Client as TokenClient,
    Address, Env, Symbol, Vec,
};


#[derive(Clone)]
#[contracttype]
pub struct Phase {
    pub completed: bool,
}

#[derive(Clone)]
#[contracttype]
pub struct Agreement {
    pub client: Address,
    pub contractor: Address,
    pub asset: Address,
    pub budget: i128,
    pub phases: Vec<Phase>,
    pub disbursed: i128,
}



#[contract]
pub struct MilestoneForge;

#[contractimpl]
impl MilestoneForge {

    pub fn init_agreement(
        env: Env,
        deal_id: Symbol,
        client: Address,
        contractor: Address,
        asset: Address,
        budget: i128,
        phase_count: u32,
    ) {
        client.require_auth();

       
        let token = TokenClient::new(&env, &asset);
        token.transfer(&client, &env.current_contract_address(), &budget);

       
        let mut phases: Vec<Phase> = Vec::new(&env);
        for _ in 0..phase_count {
            phases.push_back(Phase { completed: false });
        }

        let agreement = Agreement {
            client,
            contractor,
            asset,
            budget,
            phases,
            disbursed: 0,
        };

        
        env.storage().instance().set(&deal_id, &agreement);
    }

   
    pub fn approve_phase(env: Env, deal_id: Symbol, phase_idx: u32) {
        let mut agreement: Agreement = env.storage().instance().get(&deal_id).unwrap();

        agreement.client.require_auth();

        let len = agreement.phases.len();
        assert!(phase_idx < len, "phase index out of range");

       
        let mut updated: Vec<Phase> = Vec::new(&env);
        for i in 0..len {
            let phase = agreement.phases.get(i).unwrap();
            if i == phase_idx {
                updated.push_back(Phase { completed: true });
            } else {
                updated.push_back(phase);
            }
        }

        agreement.phases = updated;
        env.storage().instance().set(&deal_id, &agreement);
    }

    pub fn withdraw(env: Env, deal_id: Symbol) {
        let mut agreement: Agreement = env.storage().instance().get(&deal_id).unwrap();

        agreement.contractor.require_auth();

        
        let phase_total = agreement.phases.len() as i128;
        let mut approved_count: i128 = 0;
        for i in 0..agreement.phases.len() {
            if agreement.phases.get(i).unwrap().completed {
                approved_count += 1;
            }
        }

  
        let earned = (agreement.budget * approved_count) / phase_total;
        let pending = earned - agreement.disbursed;

        if pending <= 0 {
            return;
        }

        let token = TokenClient::new(&env, &agreement.asset);
        token.transfer(&env.current_contract_address(), &agreement.contractor, &pending);

        agreement.disbursed += pending;
        env.storage().instance().set(&deal_id, &agreement);
    }

 
    pub fn terminate(env: Env, deal_id: Symbol) {
        let agreement: Agreement = env.storage().instance().get(&deal_id).unwrap();

        agreement.client.require_auth();

        let recoverable = agreement.budget - agreement.disbursed;
        if recoverable > 0 {
            let token = TokenClient::new(&env, &agreement.asset);
            token.transfer(&env.current_contract_address(), &agreement.client, &recoverable);
        }

        env.storage().instance().remove(&deal_id);
    }


    pub fn get_agreement(env: Env, deal_id: Symbol) -> Agreement {
        env.storage().instance().get(&deal_id).unwrap()
    }
}

mod test;