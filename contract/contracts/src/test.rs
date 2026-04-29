#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{Client as TokenClient, StellarAssetClient},
    Address, Env, Symbol,
};

fn setup_env() -> (Env, Address, Address, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    
    let contract_id = env.register(MilestoneForge, ());

    let token_admin = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
    let token_admin_client = StellarAssetClient::new(&env, &token_id);

    let client_addr = Address::generate(&env);
    let contractor_addr = Address::generate(&env);

    token_admin_client.mint(&client_addr, &1_000_0000000_i128);

    (env, contract_id, token_id, client_addr, contractor_addr)
}


#[test]
fn test_full_lifecycle_withdraw() {
    let (env, contract_id, token_id, client_addr, contractor_addr) = setup_env();

    let forge = MilestoneForgeClient::new(&env, &contract_id);
    let token = TokenClient::new(&env, &token_id);

    let deal_id = Symbol::new(&env, "proj_alpha");
    let budget: i128 = 300_0000000; 

    forge.init_agreement(
        &deal_id,
        &client_addr,
        &contractor_addr,
        &token_id,
        &budget,
        &3_u32,
    );

    
    assert_eq!(token.balance(&contract_id), budget);
    assert_eq!(token.balance(&client_addr), 700_0000000); 

    
    forge.approve_phase(&deal_id, &0_u32);
    forge.approve_phase(&deal_id, &1_u32);
    forge.approve_phase(&deal_id, &2_u32);

    let agreement = forge.get_agreement(&deal_id);
    assert!(agreement.phases.iter().all(|p| p.completed));

    
    forge.withdraw(&deal_id);

    assert_eq!(token.balance(&contractor_addr), budget);
    assert_eq!(token.balance(&contract_id), 0);

    let agreement_after = forge.get_agreement(&deal_id);
    assert_eq!(agreement_after.disbursed, budget);
}


#[test]
fn test_partial_withdraw_proportional() {
    let (env, contract_id, token_id, client_addr, contractor_addr) = setup_env();

    let forge = MilestoneForgeClient::new(&env, &contract_id);
    let token = TokenClient::new(&env, &token_id);

    let deal_id = Symbol::new(&env, "proj_beta");
    let budget: i128 = 400_0000000; 

    forge.init_agreement(
        &deal_id,
        &client_addr,
        &contractor_addr,
        &token_id,
        &budget,
        &4_u32,
    );

    
    forge.approve_phase(&deal_id, &0_u32);
    forge.approve_phase(&deal_id, &1_u32);

    
    forge.withdraw(&deal_id);
    assert_eq!(token.balance(&contractor_addr), 200_0000000);
    assert_eq!(token.balance(&contract_id), 200_0000000);

    
    forge.approve_phase(&deal_id, &2_u32);

    
    forge.withdraw(&deal_id);
    assert_eq!(token.balance(&contractor_addr), 300_0000000);
    assert_eq!(token.balance(&contract_id), 100_0000000);

    let agreement = forge.get_agreement(&deal_id);
    assert_eq!(agreement.disbursed, 300_0000000);
}


#[test]
fn test_terminate_refunds_remainder() {
    let (env, contract_id, token_id, client_addr, contractor_addr) = setup_env();

    let forge = MilestoneForgeClient::new(&env, &contract_id);
    let token = TokenClient::new(&env, &token_id);

    let deal_id = Symbol::new(&env, "proj_gamma");
    let budget: i128 = 500_0000000; // 500 XLM
    let client_initial = token.balance(&client_addr); 

    forge.init_agreement(
        &deal_id,
        &client_addr,
        &contractor_addr,
        &token_id,
        &budget,
        &5_u32,
    );

    
    forge.approve_phase(&deal_id, &0_u32);
    forge.approve_phase(&deal_id, &1_u32);

    
    forge.withdraw(&deal_id);
    assert_eq!(token.balance(&contractor_addr), 200_0000000);
    assert_eq!(token.balance(&client_addr), client_initial - budget);

    
    forge.terminate(&deal_id);

    assert_eq!(token.balance(&contract_id), 0);
    assert_eq!(token.balance(&contractor_addr), 200_0000000); 
    assert_eq!(token.balance(&client_addr), client_initial - budget + 300_0000000); 

    
    env.as_contract(&contract_id, || {
        let exists = env.storage().instance().has(&deal_id);
        assert!(!exists, "Agreement should have been removed after termination");
    });
}